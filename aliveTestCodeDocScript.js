const fs = require('fs');

const BASE_FILE_PATH = './cypress/integration';

let doc = '';
const categories = fs.readdirSync(BASE_FILE_PATH);

const excludedCategoryList = ['CP', 'RP', 'TP', 'helper'];
const regx = /describe\('(\w+)/g;
categories
  .filter(category => !excludedCategoryList.includes(category))
  .forEach(category => {
    const specs = fs.readdirSync(`${BASE_FILE_PATH}/${category}`);
    for (const spec of specs) {
      const testCode = fs.readFileSync(`${BASE_FILE_PATH}/${category}/${spec}`, 'utf-8');
    }    
  });