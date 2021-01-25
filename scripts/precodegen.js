require('dotenv').config();
const fs = require('fs').promises;

const action = async () => {
  let data = await fs.readFile('codegen.yml', { encoding: 'utf-8' });
  if (process.env.NEXT_PUBLIC_TOKEN) {
    data = data.replace('NEXT_PUBLIC_TOKEN', process.env.NEXT_PUBLIC_TOKEN);
    await fs.writeFile('codegen.yml', data, { encoding: 'utf-8' });
  }
};
action();
