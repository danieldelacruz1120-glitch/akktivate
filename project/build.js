// build.js — Rebuilds Akktivate.html by inlining source modules.
// Run via run_script: const s = await readFile('build.js'); await new Function('readFile','saveFile','log','return (async()=>{'+s+'})()')(readFile,saveFile,log);
async function build() {
  const styles = await readFile('styles.css');
  const data = await readFile('data.js');
  const logoData = await readFile('logo-data.js');
  const tools = await readFile('tools.js');
  const icons = await readFile('icons.jsx');
  const ui = await readFile('ui.jsx');
  const dashboard = await readFile('dashboard.jsx');
  const routes = await readFile('routes.jsx');
  const community = await readFile('community.jsx');
  const profile = await readFile('profile.jsx');
  const auth = await readFile('auth.jsx');
  const onboarding = await readFile('onboarding.jsx');
  const assistant = await readFile('assistant.jsx');
  const app = await readFile('app.jsx');

  const SCR = '<' + 'script';
  const ESCR = '</' + 'script>';
  const block = (type, content) =>
    '  ' + SCR + (type ? ' type="' + type + '"' : '') + '>\n' + content + '\n  ' + ESCR + '\n';

  const html =
    '<!doctype html>\n<html lang="es">\n<head>\n' +
    '  <meta charset="utf-8">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '  <title>Akktivate</title>\n' +
    '  <link rel="preconnect" href="https://fonts.googleapis.com">\n' +
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    '  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">\n' +
    '  <style>\n' + styles + '\n  </style>\n</head>\n<body>\n' +
    '  <div id="root"></div>\n' +
    '  ' + SCR + ' src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous">' + ESCR + '\n' +
    '  ' + SCR + ' src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous">' + ESCR + '\n' +
    '  ' + SCR + ' src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous">' + ESCR + '\n' +
    block('', data) +
    block('', logoData) +
    block('', tools) +
    block('text/babel', icons) +
    block('text/babel', ui) +
    block('text/babel', dashboard) +
    block('text/babel', routes) +
    block('text/babel', community) +
    block('text/babel', profile) +
    block('text/babel', auth) +
    block('text/babel', onboarding) +
    block('text/babel', assistant) +
    block('text/babel', app) +
    '</body>\n</html>\n';

  await saveFile('Akktivate.html', html);
  log('Wrote ' + html.length + ' chars');
}
await build();
