// Plain ES modules in the browser — no bundler, no framework, no build step.
// Pages are functions returning HTML; the router swaps them on hash change.
import { greet } from './workspace-toolkit.js';

const pages = {
  '': () => `
    <h1>Welcome</h1>
    <p>${greet('workspace')}</p>
    <p>This app came from a plain client-side template: no framework, no bundler.</p>
    <a class="cta" href="#/about">What is this?</a>
  `,
  '#/about': () => `
    <h1>About</h1>
    <p>Every app created from this template starts as a copy of its repository,
       and keeps the repository's own conventions.</p>
    <a class="cta" href="#/">Back home</a>
  `,
};

function render() {
  const page = pages[location.hash] ?? pages[''];
  document.getElementById('app').innerHTML = page();
}

addEventListener('hashchange', render);
render();
