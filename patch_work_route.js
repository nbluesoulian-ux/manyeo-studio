const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '_astro', 'hoisted.CUO_IjfL.js');
let js = fs.readFileSync(jsPath, 'utf8');

const target1 = 'class ProjectsPage extends Page{path="projects";id="projects";';
const rep1 = 'class ProjectsPage extends Page{path="(projects|work)";id="projects";';
if (!js.includes(target1)) {
  console.log('target1 already modified or not found');
} else {
  js = js.replace(target1, rep1);
}

const target2 = 'if(n.regExp.test(this.path)){t=n;break}}t||(';
const rep2 = 'if(n.regExp.test(this.path)){t=n;break}}if(!t&&(this.path==="work"||this.path==="projects"))t={target:projectsPage};t||(';
if (!js.includes(target2)) {
  console.log('target2 already modified or not found');
} else {
  js = js.replace(target2, rep2);
}

const target3 = 'routeManager.currRoute.pathNodes[0]==="projects"&&';
const rep3 = '(routeManager.currRoute.pathNodes[0]==="projects"||routeManager.currRoute.pathNodes[0]==="work")&&';
if (!js.includes(target3)) {
  console.log('target3 already modified or not found');
} else {
  js = js.replace(target3, rep3);
}

fs.writeFileSync(jsPath, js, 'utf8');
console.log('Successfully patched Manyeo_studio/_astro/hoisted.CUO_IjfL.js!');
