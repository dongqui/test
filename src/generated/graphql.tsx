import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  Time: any;
  /** The `Long` scalar type represents non-fractional signed whole numeric values. Long can represent values between -(2^63) and 2^63 - 1. */
  Long: any;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Create a new document in the collection of 'UserEntry' */
  createUserEntry: UserEntry;
  /** Update an existing document in the collection of 'UserEntry' */
  updateUserEntry?: Maybe<UserEntry>;
  /** Delete an existing document in the collection of 'UserEntry' */
  deleteUserEntry?: Maybe<UserEntry>;
};

export type MutationCreateUserEntryArgs = {
  data: UserEntryInput;
};

export type MutationUpdateUserEntryArgs = {
  id: Scalars['ID'];
  data: UserEntryInput;
};

export type MutationDeleteUserEntryArgs = {
  id: Scalars['ID'];
};

/** 'UserEntry' input values */
export type UserEntryInput = {
  email?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
  isVerifiedEmail?: Maybe<Scalars['Boolean']>;
};

export type Query = {
  __typename?: 'Query';
  /** Find a document from the collection of 'UserEntry' by its id. */
  findUserEntryByID?: Maybe<UserEntry>;
  users: UserEntryPage;
  findUserEntryByEmail?: Maybe<UserEntry>;
};

export type QueryFindUserEntryByIdArgs = {
  id: Scalars['ID'];
};

export type QueryUsersArgs = {
  _size?: Maybe<Scalars['Int']>;
  _cursor?: Maybe<Scalars['String']>;
};

export type QueryFindUserEntryByEmailArgs = {
  email: Scalars['String'];
};

export type UserEntry = {
  __typename?: 'UserEntry';
  name?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  /** The document's ID. */
  _id: Scalars['ID'];
  isVerifiedEmail?: Maybe<Scalars['Boolean']>;
  password?: Maybe<Scalars['String']>;
  /** The document's timestamp. */
  _ts: Scalars['Long'];
};

/** The pagination object for elements of type 'UserEntry'. */
export type UserEntryPage = {
  __typename?: 'UserEntryPage';
  /** The elements of type 'UserEntry' in this page. */
  data: Array<Maybe<UserEntry>>;
  /** A cursor for elements coming after the current page. */
  after?: Maybe<Scalars['String']>;
  /** A cursor for elements coming before the current page. */
  before?: Maybe<Scalars['String']>;
};

export type UsersQueryVariables = Exact<{ [key: string]: never }>;

export type UsersQuery = { __typename?: 'Query' } & {
  users: { __typename?: 'UserEntryPage' } & {
    data: Array<
      Maybe<{ __typename?: 'UserEntry' } & Pick<UserEntry, '_id' | 'name' | 'email' | 'password'>>
    >;
  };
};

export type FindUserEntryByIdQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type FindUserEntryByIdQuery = { __typename?: 'Query' } & {
  findUserEntryByID?: Maybe<
    { __typename?: 'UserEntry' } & Pick<UserEntry, '_id' | 'name' | 'email' | 'password' | '_ts'>
  >;
};

export type FindUserEntryByEmailQueryVariables = Exact<{
  email: Scalars['String'];
}>;

export type FindUserEntryByEmailQuery = { __typename?: 'Query' } & {
  findUserEntryByEmail?: Maybe<
    { __typename?: 'UserEntry' } & Pick<
      UserEntry,
      '_id' | 'email' | 'name' | 'password' | 'isVerifiedEmail' | '_ts'
    >
  >;
};

export type CreateUserEntryMutationVariables = Exact<{
  email: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  password: Scalars['String'];
  isVerifiedEmail: Scalars['Boolean'];
}>;

export type CreateUserEntryMutation = { __typename?: 'Mutation' } & {
  createUserEntry: { __typename?: 'UserEntry' } & Pick<
    UserEntry,
    '_id' | 'email' | 'name' | 'isVerifiedEmail'
  >;
};

export type UpdateIsVerifiedEmailUserEntryMutationVariables = Exact<{
  id: Scalars['ID'];
  isVerifiedEmail: Scalars['Boolean'];
}>;

export type UpdateIsVerifiedEmailUserEntryMutation = { __typename?: 'Mutation' } & {
  updateUserEntry?: Maybe<
    { __typename?: 'UserEntry' } & Pick<UserEntry, '_id' | 'email' | 'name' | 'isVerifiedEmail'>
  >;
};

export type UpdatePasswordUserEntryMutationVariables = Exact<{
  id: Scalars['ID'];
  password: Scalars['String'];
}>;

export type UpdatePasswordUserEntryMutation = { __typename?: 'Mutation' } & {
  updateUserEntry?: Maybe<
    { __typename?: 'UserEntry' } & Pick<UserEntry, '_id' | 'email' | 'name' | 'isVerifiedEmail'>
  >;
};

export const UsersDocument = gql`
  query users {
    users {
      data {
        _id
        name
        email
        password
      }
    }
  }
`;

/**
 * __useUsersQuery__
 *
 * To run a query within a React component, call `useUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useUsersQuery(
  baseOptions?: Apollo.QueryHookOptions<UsersQuery, UsersQueryVariables>,
) {
  return Apollo.useQuery<UsersQuery, UsersQueryVariables>(UsersDocument, baseOptions);
}
export function useUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<UsersQuery, UsersQueryVariables>,
) {
  return Apollo.useLazyQuery<UsersQuery, UsersQueryVariables>(UsersDocument, baseOptions);
}
export type UsersQueryHookResult = ReturnType<typeof useUsersQuery>;
export type UsersLazyQueryHookResult = ReturnType<typeof useUsersLazyQuery>;
export type UsersQueryResult = Apollo.QueryResult<UsersQuery, UsersQueryVariables>;
export const FindUserEntryByIdDocument = gql`
  query findUserEntryByID($id: ID!) {
    findUserEntryByID(id: $id) {
      _id
      name
      email
      password
      _ts
    }
  }
`;

/**
 * __useFindUserEntryByIdQuery__
 *
 * To run a query within a React component, call `useFindUserEntryByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindUserEntryByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindUserEntryByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFindUserEntryByIdQuery(
  baseOptions: Apollo.QueryHookOptions<FindUserEntryByIdQuery, FindUserEntryByIdQueryVariables>,
) {
  return Apollo.useQuery<FindUserEntryByIdQuery, FindUserEntryByIdQueryVariables>(
    FindUserEntryByIdDocument,
    baseOptions,
  );
}
export function useFindUserEntryByIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    FindUserEntryByIdQuery,
    FindUserEntryByIdQueryVariables
  >,
) {
  return Apollo.useLazyQuery<FindUserEntryByIdQuery, FindUserEntryByIdQueryVariables>(
    FindUserEntryByIdDocument,
    baseOptions,
  );
}
export type FindUserEntryByIdQueryHookResult = ReturnType<typeof useFindUserEntryByIdQuery>;
export type FindUserEntryByIdLazyQueryHookResult = ReturnType<typeof useFindUserEntryByIdLazyQuery>;
export type FindUserEntryByIdQueryResult = Apollo.QueryResult<
  FindUserEntryByIdQuery,
  FindUserEntryByIdQueryVariables
>;
export const FindUserEntryByEmailDocument = gql`
  query findUserEntryByEmail($email: String!) {
    findUserEntryByEmail(email: $email) {
      _id
      email
      name
      password
      isVerifiedEmail
      _ts
    }
  }
`;

/**
 * __useFindUserEntryByEmailQuery__
 *
 * To run a query within a React component, call `useFindUserEntryByEmailQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindUserEntryByEmailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindUserEntryByEmailQuery({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useFindUserEntryByEmailQuery(
  baseOptions: Apollo.QueryHookOptions<
    FindUserEntryByEmailQuery,
    FindUserEntryByEmailQueryVariables
  >,
) {
  return Apollo.useQuery<FindUserEntryByEmailQuery, FindUserEntryByEmailQueryVariables>(
    FindUserEntryByEmailDocument,
    baseOptions,
  );
}
export function useFindUserEntryByEmailLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    FindUserEntryByEmailQuery,
    FindUserEntryByEmailQueryVariables
  >,
) {
  return Apollo.useLazyQuery<FindUserEntryByEmailQuery, FindUserEntryByEmailQueryVariables>(
    FindUserEntryByEmailDocument,
    baseOptions,
  );
}
export type FindUserEntryByEmailQueryHookResult = ReturnType<typeof useFindUserEntryByEmailQuery>;
export type FindUserEntryByEmailLazyQueryHookResult = ReturnType<
  typeof useFindUserEntryByEmailLazyQuery
>;
export type FindUserEntryByEmailQueryResult = Apollo.QueryResult<
  FindUserEntryByEmailQuery,
  FindUserEntryByEmailQueryVariables
>;
export const CreateUserEntryDocument = gql`
  mutation createUserEntry(
    $email: String!
    $name: String
    $password: String!
    $isVerifiedEmail: Boolean!
  ) {
    createUserEntry(
      data: { email: $email, name: $name, password: $password, isVerifiedEmail: $isVerifiedEmail }
    ) {
      _id
      email
      name
      isVerifiedEmail
    }
  }
`;
export type CreateUserEntryMutationFn = Apollo.MutationFunction<
  CreateUserEntryMutation,
  CreateUserEntryMutationVariables
>;

/**
 * __useCreateUserEntryMutation__
 *
 * To run a mutation, you first call `useCreateUserEntryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserEntryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserEntryMutation, { data, loading, error }] = useCreateUserEntryMutation({
 *   variables: {
 *      email: // value for 'email'
 *      name: // value for 'name'
 *      password: // value for 'password'
 *      isVerifiedEmail: // value for 'isVerifiedEmail'
 *   },
 * });
 */
export function useCreateUserEntryMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateUserEntryMutation,
    CreateUserEntryMutationVariables
  >,
) {
  return Apollo.useMutation<CreateUserEntryMutation, CreateUserEntryMutationVariables>(
    CreateUserEntryDocument,
    baseOptions,
  );
}
export type CreateUserEntryMutationHookResult = ReturnType<typeof useCreateUserEntryMutation>;
export type CreateUserEntryMutationResult = Apollo.MutationResult<CreateUserEntryMutation>;
export type CreateUserEntryMutationOptions = Apollo.BaseMutationOptions<
  CreateUserEntryMutation,
  CreateUserEntryMutationVariables
>;
export const UpdateIsVerifiedEmailUserEntryDocument = gql`
  mutation updateIsVerifiedEmailUserEntry($id: ID!, $isVerifiedEmail: Boolean!) {
    updateUserEntry(id: $id, data: { isVerifiedEmail: $isVerifiedEmail }) {
      _id
      email
      name
      isVerifiedEmail
    }
  }
`;
export type UpdateIsVerifiedEmailUserEntryMutationFn = Apollo.MutationFunction<
  UpdateIsVerifiedEmailUserEntryMutation,
  UpdateIsVerifiedEmailUserEntryMutationVariables
>;

/**
 * __useUpdateIsVerifiedEmailUserEntryMutation__
 *
 * To run a mutation, you first call `useUpdateIsVerifiedEmailUserEntryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateIsVerifiedEmailUserEntryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateIsVerifiedEmailUserEntryMutation, { data, loading, error }] = useUpdateIsVerifiedEmailUserEntryMutation({
 *   variables: {
 *      id: // value for 'id'
 *      isVerifiedEmail: // value for 'isVerifiedEmail'
 *   },
 * });
 */
export function useUpdateIsVerifiedEmailUserEntryMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateIsVerifiedEmailUserEntryMutation,
    UpdateIsVerifiedEmailUserEntryMutationVariables
  >,
) {
  return Apollo.useMutation<
    UpdateIsVerifiedEmailUserEntryMutation,
    UpdateIsVerifiedEmailUserEntryMutationVariables
  >(UpdateIsVerifiedEmailUserEntryDocument, baseOptions);
}
export type UpdateIsVerifiedEmailUserEntryMutationHookResult = ReturnType<
  typeof useUpdateIsVerifiedEmailUserEntryMutation
>;
export type UpdateIsVerifiedEmailUserEntryMutationResult = Apollo.MutationResult<UpdateIsVerifiedEmailUserEntryMutation>;
export type UpdateIsVerifiedEmailUserEntryMutationOptions = Apollo.BaseMutationOptions<
  UpdateIsVerifiedEmailUserEntryMutation,
  UpdateIsVerifiedEmailUserEntryMutationVariables
>;
export const UpdatePasswordUserEntryDocument = gql`
  mutation updatePasswordUserEntry($id: ID!, $password: String!) {
    updateUserEntry(id: $id, data: { password: $password }) {
      _id
      email
      name
      isVerifiedEmail
    }
  }
`;
export type UpdatePasswordUserEntryMutationFn = Apollo.MutationFunction<
  UpdatePasswordUserEntryMutation,
  UpdatePasswordUserEntryMutationVariables
>;

/**
 * __useUpdatePasswordUserEntryMutation__
 *
 * To run a mutation, you first call `useUpdatePasswordUserEntryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePasswordUserEntryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePasswordUserEntryMutation, { data, loading, error }] = useUpdatePasswordUserEntryMutation({
 *   variables: {
 *      id: // value for 'id'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useUpdatePasswordUserEntryMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdatePasswordUserEntryMutation,
    UpdatePasswordUserEntryMutationVariables
  >,
) {
  return Apollo.useMutation<
    UpdatePasswordUserEntryMutation,
    UpdatePasswordUserEntryMutationVariables
  >(UpdatePasswordUserEntryDocument, baseOptions);
}
export type UpdatePasswordUserEntryMutationHookResult = ReturnType<
  typeof useUpdatePasswordUserEntryMutation
>;
export type UpdatePasswordUserEntryMutationResult = Apollo.MutationResult<UpdatePasswordUserEntryMutation>;
export type UpdatePasswordUserEntryMutationOptions = Apollo.BaseMutationOptions<
  UpdatePasswordUserEntryMutation,
  UpdatePasswordUserEntryMutationVariables
>;
