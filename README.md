# Topological Renderer

![Topological Pattern](./thumbnail.png)

A custom WebGL implementation that renders an animated topological pattern based on perlin noise.
Makes for a very soothing background for your website.

Check out the demo [here](https://topology.sigrist.dev)

## Installation
```
npm i topology-renderer
```
## Usage
The package contains just one function, _topology_. It implements the [svelte-action interface](https://svelte.dev/docs#template-syntax-element-directives-use-action), but works
just fine with vanilla JS as well.

It takes a canvas element, and some options.
```js
import { topology } from 'topology-renderer';

const canvas = document.getElementById('canvas');
const options = {
  background_color: [0, 22, 37],
  line_color: [41, 56, 76],
  speed: 1,
  width: 300,
  height: 150,
}; //These are the default values - All are optional

const { update, destroy } = topology(canvas, options);
```

You can change the options at any time using the update method returned by the topology function. It overwrites the old options with the new ones.

```js
update({
  background_color: [0, 22, 37],
  line_color: [41, 56, 76],
  speed: 1,
  width: 300,
  height: 150,
});
```

> Note 1: The if the new options do not contain all values, they are **not** merged with the existing options, but instead with the default values. This follows the svelte-action convention.

>Note 2: The function internally copies the options object, so you do not have to worry about mutations on the object you pass in.

To stop the renderer, call the destroy method returned by the topology function.
```js
destroy();
```
I'ts recommended to call the destroy method when your component is destroyed, to prevent memory leaks.
