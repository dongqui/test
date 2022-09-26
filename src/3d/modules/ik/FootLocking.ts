import { AnimationGroup, IAnimationKey, Nullable, Scalar, TransformNode, Vector3 } from '@babylonjs/core';
import { AnimationIngredient, ArrayOfThreeNumbers, PlaskProperty, PlaskRetargetMap, PlaskTrack } from 'types/common';
import { AnimationModule } from '../animation/AnimationModule';
import { IKController } from './IKController';

export class FootLocking {
  constructor(
    public animationIngredient: AnimationIngredient,
    public animationGroup: AnimationGroup,
    public retargetMap: PlaskRetargetMap,
    public readonlyHeelTransformKeys: IAnimationKey[],
    public readonlyToeTransformKeys: IAnimationKey[],
    public side: string,
    public ikController: IKController,
  ) {}
  public static readonly Y_MARGIN = 0.15; // Approx world units between the heel and the ground (Y axis)
  public static readonly INTERPOLATION_FRAMES = 4;
  public static readonly LOW_PASS_FILTER_MIN_FRAMES = 2;

  public static FixIKOnGround = (frameIKPosition: Vector3[]) => {
    // Now fix IK positions
    for (let i = 0; i < frameIKPosition.length; i++) {
      frameIKPosition[i].y = FootLocking.Y_MARGIN;
    }
  };

  public fixHipPosition = (frameIKPosition: Vector3[], transformKeys: IAnimationKey[], hipTrack: PlaskTrack, layerId: string) => {
    let j = 0;
    const groundCorrectionEachFrame: number[] = [];
    let targetAnimation = this.animationIngredient;

    while (j < transformKeys.length) {
      if (transformKeys[j].value === -1) {
        // No correction for ignored frames
        groundCorrectionEachFrame.push(0);
        j++;
        continue;
      }

      if (transformKeys[j].value) {
        // In contact, ground position is hard set
        groundCorrectionEachFrame.push(-frameIKPosition[j].y + FootLocking.Y_MARGIN);
        j++;
        continue;
      }

      // Out of contact, we interpolate ground till the next contact
      let i = j;
      let initialGroundCorrection = groundCorrectionEachFrame.length ? groundCorrectionEachFrame[groundCorrectionEachFrame.length - 1] : null;
      while (i < transformKeys.length && !transformKeys[i].value) {
        i++;
      }
      let nbFramesOutOfContact = i - j;
      let endGroundCorrection = null;
      if (i < transformKeys.length) {
        endGroundCorrection = -frameIKPosition[i].y + FootLocking.Y_MARGIN;
      }

      for (let k = j; k < i; k++) {
        let value;
        if (initialGroundCorrection === null) {
          value = endGroundCorrection || 0;
        } else if (endGroundCorrection === null) {
          value = initialGroundCorrection;
        } else {
          value = Scalar.Lerp(initialGroundCorrection, endGroundCorrection, (k - j) / nbFramesOutOfContact);
        }
        groundCorrectionEachFrame.push(value);
      }

      j = i;
    }

    for (let i = 0; i < hipTrack.transformKeys.length; i++) {
      const positionCorrected = (hipTrack.transformKeys[i].value as Vector3).clone();
      // positionCorrected.y += groundCorrectionEachFrame[i];
      // Hipspace scaling
      positionCorrected.z += -groundCorrectionEachFrame[i] * 100;
      // positionCorrected.z += (2 * (groundCorrectionEachFrame[i] * 100 * hipSpace)) / 106;
      const targetDataList = [
        {
          targetId: hipTrack.targetId,
          property: 'position' as PlaskProperty,
          value: positionCorrected.asArray() as ArrayOfThreeNumbers,
        },
      ];
      targetAnimation = AnimationModule.EditKeyframesWithParams(targetAnimation as AnimationIngredient, layerId, transformKeys[i].frame, targetDataList)!;

      if (!targetAnimation) {
        throw new Error('Foot locking error in keyframe editing');
      }
    }

    this.animationIngredient = targetAnimation;

    return targetAnimation;
  };

  public cloneTransformKeys = (transformKeys: IAnimationKey[]) => {
    // The purpose of this function is to give a writable copy of transform keys
    // So we can apply filters, without altering the read-only state object
    const result: IAnimationKey[] = [];
    for (const key of transformKeys) {
      result.push({
        value: key.value,
        frame: key.frame,
      });
    }

    return result;
  };

  public extractHeelPoseAtFrame(frameIndex: number) {
    this.animationGroup.goToFrame(frameIndex);
    this.ikController.fkInfluenceChain![0].computeWorldMatrix(true);
    return {
      position: this.ikController.fkInfluenceChain![0].absolutePosition.clone(),
      quaternion: this.ikController.fkInfluenceChain![0].absoluteRotationQuaternion.clone(),
      poleAngle: 0,
    };
  }

  // TODO : Absolutely no check on this function - use the bone's linked transform node as we know the bone exists
  public extractToePoseAtFrame(frameIndex: number) {
    this.animationGroup.goToFrame(frameIndex);
    this.ikController.fkInfluenceChain![0].getChildren()[0]!.computeWorldMatrix(true);
    return {
      position: (this.ikController.fkInfluenceChain![0].getChildren()[0] as TransformNode).absolutePosition.clone(),
      quaternion: (this.ikController.fkInfluenceChain![0].getChildren()[0] as TransformNode).absoluteRotationQuaternion.clone(),
      poleAngle: 0,
    };
  }

  public filterKeys(transformKeys: IAnimationKey[]) {
    // We apply 2 filters in this function :
    // Low pass filter contact data (we want to remove short contact/out of contact periods)
    // And averaging filter in contact periods
    let j = 0;
    // Contact filter
    while (j < transformKeys.length) {
      // Safeguard : sometimes undefined and NaN are present in transformkeys
      if (isNaN(transformKeys[j].value) || transformKeys[j].value === undefined) {
        transformKeys[j].value = 0;
      }
      // -1 are ignored frames
      if (transformKeys[j].value === -1) {
        j++;
        continue;
      }

      let currentPhase = transformKeys[j].value;
      for (let i = j + 1; i < transformKeys.length; i++) {
        if (i === transformKeys.length - 1) {
          // End of the list, we are done
          j = transformKeys.length;
          break;
        }
        if (transformKeys[i].value !== currentPhase) {
          if (i - j < FootLocking.LOW_PASS_FILTER_MIN_FRAMES) {
            // The locking / unlocking phase is too short, flip the status to ignore this phase
            for (let k = j; k < i; k++) {
              transformKeys[k].value = 1 - transformKeys[k].value;
            }
            // Continue this phase as an opposite phase
            currentPhase = 1 - currentPhase;
          } else {
            // This phase was long enough, we can proceed to the next one
            j = i;
            break;
          }
        }
      }
    }
  }

  public computeFrameIKValues() {
    const heelTransformKeys = this.cloneTransformKeys(this.readonlyHeelTransformKeys);
    const toeTransformKeys = this.cloneTransformKeys(this.readonlyToeTransformKeys);
    const frameIKPosition: Vector3[] = [];
    const frameBlend: number[] = [];

    if (!heelTransformKeys.length || !toeTransformKeys.length || toeTransformKeys.length !== heelTransformKeys.length) {
      console.warn("Problem with transformkeys' length in contact data.");
      throw new Error();
    }

    this.filterKeys(heelTransformKeys);
    this.filterKeys(toeTransformKeys);

    // After low pass filter, we have definitive phases, we can write them
    const phases = [];
    let j = 0;
    while (j < heelTransformKeys.length) {
      let i = j;
      const phaseObject = { length: 0, toe: toeTransformKeys[j].value, heel: heelTransformKeys[j].value, target: null as Nullable<Vector3>, startFrame: j };
      console.log(`${this.side} foot : phase from ${j} : toe is ${phaseObject.toe} and heel is ${phaseObject.heel}`);
      phases.push(phaseObject);

      while (i < heelTransformKeys.length && phaseObject.toe === toeTransformKeys[i].value && phaseObject.heel === heelTransformKeys[i].value) {
        i++;
        phaseObject.length++;
      }
      console.log(`ends in ${j}`);
      j = i;
    }

    // Averaging filter
    j = 0;
    let iKPositions = [];
    let frameIndex = 0;
    // Write phases of contact toe/ contact heel/ both/ no contact
    for (let j = 0; j < phases.length; j++) {
      const phase = phases[j];
      if ((phase.toe === -1 || phase.toe === 0) && (phase.heel === -1 || phase.heel === 0)) {
        frameIndex += phase.length;
        continue;
      }

      let targetPosition = new Vector3();
      let framePosition: Vector3;
      for (let i = 0; i < phase.length; i++) {
        if (phase.heel === 1) {
          // If heel is in contact, it supercedes toe
          framePosition = this.extractHeelPoseAtFrame(frameIndex).position;
        } else {
          // Heel is out of contact, we will use toe
          framePosition = this.extractToePoseAtFrame(frameIndex).position;
        }

        targetPosition.addInPlace(framePosition);
        frameIndex++;
      }
      if (phase.length > 0) {
        targetPosition.scaleInPlace(1 / phase.length);
      }
      iKPositions.push(targetPosition);
      phase.target = targetPosition.clone();
    }

    // We write also "broadPhases" containing lock/unlock status (regardless of toe/heel), to compute the IK blend
    const broadPhases: { state: boolean; length: number; startFrame: number }[] = [];
    frameIndex = 0;

    for (let j = 0; j < phases.length; j++) {
      const phase = phases[j];
      const previousPhase = broadPhases.length ? broadPhases[broadPhases.length - 1] : null;
      const lockState = phase.toe === 1 || phase.heel === 1;
      if (!previousPhase || lockState !== previousPhase.state) {
        broadPhases.push({ state: lockState, length: phase.length, startFrame: frameIndex });
      } else {
        previousPhase.length += phase.length;
      }
      frameIndex += phase.length;
    }

    // Here we have all averaged IK positions in locking phases, we can now assign them to every frame
    // Lerping the pos in no contact phases
    frameIndex = 0;
    for (let j = 0; j < phases.length - 1; j++) {
      const phaseIn = phases[j];
      const phaseOut = phases[j + 1];
      // const previousPhase = j > 0 ? phases[j - 1] : null;
      const inRunway = Math.min(Math.floor(phaseIn.length / 2), Math.floor(FootLocking.INTERPOLATION_FRAMES / 2));
      const outRunway = Math.min(Math.floor(phaseOut.length / 2), Math.ceil(FootLocking.INTERPOLATION_FRAMES / 2));
      const indexBegin = phaseIn.startFrame + phaseIn.length - inRunway;
      const indexEnd = indexBegin + inRunway + outRunway;
      let targetStart: Vector3;
      let targetEnd: Vector3;

      frameIndex = Math.min(frameIKPosition.length, indexBegin);
      while (frameIndex < phaseOut.startFrame + phaseOut.length) {
        if ((phaseIn.toe === 1 || phaseIn.heel === 1) && (phaseOut.toe === 1 || phaseOut.heel === 1)) {
          // This is a blend between 2 contact phases
          targetStart = phaseIn.target!.clone();
          targetEnd = phaseOut.target!.clone();
          if (phaseIn.heel !== 1) {
            this.ikController.ikController.computeTargetPosition(phaseIn.target!, this.extractHeelPoseAtFrame(phaseOut.startFrame).quaternion, targetStart);
          }
          if (phaseOut.heel !== 1) {
            this.ikController.ikController.computeTargetPosition(phaseOut.target!, this.extractHeelPoseAtFrame(phaseOut.startFrame).quaternion, targetEnd);
          }
        } else if ((phaseIn.toe === 1 || phaseIn.heel === 1) && !(phaseOut.toe === 1 || phaseOut.heel === 1)) {
          // Blend from contact to no contact
          targetStart = phaseIn.target!.clone();
          targetEnd = phaseIn.target!.clone();
          if (phaseIn.heel !== 1) {
            this.ikController.ikController.computeTargetPosition(phaseIn.target!, this.extractHeelPoseAtFrame(phaseIn.startFrame + phaseIn.length - 1).quaternion, targetStart);
            targetEnd.copyFrom(targetStart);
          }
        } else if (!(phaseIn.toe === 1 || phaseIn.heel === 1) && (phaseOut.toe === 1 || phaseOut.heel === 1)) {
          // Blend from no contact to contact
          targetStart = phaseOut.target!.clone();
          targetEnd = phaseOut.target!.clone();
          if (phaseOut.heel !== 1) {
            this.ikController.ikController.computeTargetPosition(phaseOut.target!, this.extractHeelPoseAtFrame(phaseOut.startFrame).quaternion, targetStart);
            targetEnd.copyFrom(targetStart);
          }
        } else {
          // Blend from no contact to no contact
          // ! This should not happen, raise an error
          throw new Error('Error while computing contact phases');
        }
        if (indexEnd > indexBegin) {
          // We have runway to interpolate
          frameIKPosition[frameIndex] = Vector3.Lerp(targetStart, targetEnd, Scalar.Clamp((frameIndex - indexBegin) / (indexEnd - indexBegin), 0, 1));
        } else {
          // Very short phases, no interpolation
          frameIKPosition[frameIndex] = frameIndex < indexBegin ? targetStart : targetEnd;
        }
        frameIndex++;
      }

      frameIndex = 0;
      if (broadPhases.length === 1) {
        // No blend, just fill with a constant value
        const value = broadPhases[0].state ? 1 : 0;
        for (let i = 0; i < broadPhases[0].length; i++) {
          frameBlend.push(value);
        }
      } else {
        for (let j = 0; j < broadPhases.length - 1; j++) {
          // Blending broad phases 2 by 2
          const broadPhaseIn = broadPhases[j];
          const broadPhaseOut = broadPhases[j + 1];
          // Computing the runway we have for blending periods. Max being INTERPOLATION_FRAMES
          const inRunway = Math.min(Math.floor(broadPhaseIn.length / 2), Math.floor(FootLocking.INTERPOLATION_FRAMES / 2));
          const outRunway = Math.min(Math.floor(broadPhaseOut.length / 2), Math.ceil(FootLocking.INTERPOLATION_FRAMES / 2));
          const indexBlendBegin = broadPhaseIn.startFrame + broadPhaseIn.length - inRunway;
          const indexBlendEnd = indexBlendBegin + inRunway + outRunway;
          const blendStart = broadPhaseIn.state ? 1 : 0;
          const blendEnd = broadPhaseOut.state ? 1 : 0;

          frameIndex = Math.min(frameBlend.length, indexBlendBegin);
          while (frameIndex < broadPhaseOut.startFrame + broadPhaseOut.length) {
            if (indexBlendEnd > indexBlendBegin) {
              // We have runway to interpolate
              frameBlend[frameIndex] = Scalar.Lerp(blendStart, blendEnd, Scalar.Clamp((frameIndex - indexBlendBegin) / (indexBlendEnd - indexBlendBegin), 0, 1));
            } else {
              // Very short phases, no interpolation
              frameBlend[frameIndex] = frameIndex < indexBlendBegin ? blendStart : blendEnd;
            }
            frameIndex++;
          }
        }
      }

      // TODO : IK Lock position averaging cannot be independent in heel locking phases and toe locking phases
      // TODO : gather video reference to determine the best strategy
      // Here write a procedure to :
      // //1) Compute blend for each frame - DONE
      // 2) Compute quaternion for each frame (toe lock/unlock)
      // //3) Smooth out IK position for each frame for phase transitions - should be in sync with Blend
      // 4) Plug hip position correction
    }

    return { frameBlend, frameIKPosition };
  }
}
