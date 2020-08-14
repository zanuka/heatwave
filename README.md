# Heatwave
Heatwave is a pure-DOM diffing/patching solution built for the Juno framework.

## purpose
By eliminating the need to convert the rendered DOM into virtual representations, we can improve re-render performance. Heatwave also uses a different keying approach to that of `virtual-dom`, allowing the DOM to be more tolerant to third-party changes.

## API
The heatwave API is relatively simple and hides the internal complexity of DOM diffing.

### Constructing
Before any updates can be done to a view, it must first be initialized. This is done by constructing a new instance of the `Heatwave` class.

```javascript
new Heatwave(el);
```
The heatwave function takes a DOM element as it's first argument. This node is assumed to be currently rendered on the page. 

## Authors

Jordan Gensler

Mike Delucchi



