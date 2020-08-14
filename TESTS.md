# Current Tests

```bash
Start:
  Heatwave
    ✔ should be a function
    ✔ should construct with a valid DOM element
    Heatwave Constructor
      ✔ should store the element as _realElement
      ✔ should clone the node and store it as _el
      data-heatwaveid
        ✔ should add `data-heatwaveid` attribute to all nodes
        ✔ should add the correct heatwave IDs
        ✔ should respect keyed values
      Heatwave#reRef
        ✔ should update the internal _realElement reference
        ✔ should return `this`
      Heatwave#update
        ✔ should update attributes when they are set
        ✔ should update data attributes when they are set
        ✔ should update the class property correctly via className
        ✔ should change the text content when it is updated
      Heatwave Nodes Changes
        ✔ should add nodes
        ✔ should add nodes and update text and attributes in one update
        ✔ should add multiple nodes
        ✔ should add a correct data-heatwaveid to all new elements
        ✔ should add a correct data-heatwaveid to new keyed elements
        ✔ should remove nodes
        ✔ should re-id nodes

Finished in 0.114 secs / 0.042 secs

SUMMARY:
✔ 20 tests completed
```
