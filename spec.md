# Heatwave Spec - Notes

## API
The heatwave API is relatively simple and hides the internal complexity of DOM diffing.

### Constructing
Before any updates can be done to a view, it must first be initialized. This is done by constructing a new instance of the `Heatwave` class.

```javascript
new Heatwave(el);
```

The heatwave function takes a DOM element as it's first argument. This node is assumed to be currently rendered on the page. 

The constructor then performs a few simple tasks:

1. Walk the entire DOM tree of the element passed (hit every single element). Add a `data-heatwaveid` attribute to every DOM tag.
2. Once the attribute has been added to the live dom tree, the element should be stored internally under `this._realElement` for future use in updating.
3. To perform diffs of the tree, we copy a reference of the dom node internally under `this._el`. This is done with a simple assignment: `this._el = this._realElement.cloneNode(true);`. We create a cloned version of the real tree so that when we diff the new view and the old view, we can used a cloned version instead of touching the actual DOM, which gives us a performance boost.

#### `data-heatwaveid`

This attribute is added to every DOM node in the tree. Determining the value is extremely simple. The following describes a function that walks a DOM tree and assigns the attribute.

1. let `rootID` be `0`.
2. let `el` be the top-level element.
3. perform `el.setAttribute('data-heatwaveid', rootID)`
4. loop over `el.children`, let `i` be the current index, let `child` be `el.children[i]`
5. if `child.hasAttribute('key')` is `true`: let `key` be `child.getAttribute('key')`
6. let `id` be `rootID + '.' + (key ? '$' + key : i)`
7. perform `child.setAttribute('data-heatwaveid', id)`
8. if `child.children.length` is greater than `0`: set `rootID` to `id`, set `el` to `child`, run steps 4-8.

For example, we can look at the following HTML:

```html
<div>
    <nav>
        <left>
            Site
        </left>
        <right>
            Something Else
        </right>
    </nav>
    <section>
        <div>Welcome</div>
        <ul key="ul">
            <li key="first">One</li>
            <li key="second">Two</li>
            <li>Three</li>
            <li>Four</li>
        </ul>
    </section>
    <footer>
        This is <span>my footer</span>.
    </footer>
</div>
```

Assigning the attribute to this HTML based on the above description would give the following result.

```html
<div data-heatwaveid="0">
    <nav data-heatwaveid="0.0">
        <left data-heatwaveid="0.0.0">
            Site
        </left>
        <right data-heatwaveid="0.0.1">
            Something Else
        </right>
    </nav>
    <section data-heatwaveid="0.1">
        <div data-heatwaveid="0.1.0">Welcome</div>
        <ul key="ul" data-heatwaveid="0.1.$ul">
            <li key="first" data-heatwaveid="0.1.$ul.$first">One</li>
            <li key="second" data-heatwaveid="0.1.$ul.$second">Two</li>
            <li data-heatwaveid="0.1.$ul.2">Three</li>
            <li data-heatwaveid="0.1.$ul.3">Four</li>
        </ul>
    </section>
    <footer data-heatwaveid="0.2">
        This is <span data-heatwaveid="0.2.0">my footer</span>.
    </footer>
</div>
```

### Updating (Diffing)

You can update the DOM using an instance of heatwave (which is returned from the constructor).

```javascript
var heatwave = new Heatwave(el);
```

The Heatwave API exposes an `update` method that takes a new DOM node and patches the updates into the DOM.

```
heatwave.update(newNode);
```

The underlying diffing mechanics aren't nessecarily important. What is important is that the updates in the newNode get represented in the view after the update has completed.

Generally, what you'll want to happen internally is to generate a patchset containing the DOM operations that will bring `this._el` to the same state that the `newNode` is in. Then, you'll perform those patches on the actual element in the DOM (`this._realElement`). The `data-heatwaveid` attribute is designed to find elements in the DOM easily without relying on the actual order of the elements staying the same (e.g. third party libraries can manipulate the DOM but if the attribute doesn't change, you can still apply patches).

It's important to note that when adding new nodes, **they should also get the `data-heatwaveid` attribute when they get added**. This is important because you want to be able to update multiple times and if new nodes are added they need to be tracked.

An example of what this looks like in a function is found below.

```javascript
update(newNode) {
  // Diff against our internal cloned node to get patches:
  var patches = diff(this._el, newNode);
  // Apply those patches onto the real node:
  applyPatches(patches, this._realElement);
  // Finally, now we can set our internal reference to the newNode, because our DOM should be at that point (this is more memory efficient than doing `cloneNode` again).
  this._el = newNode;
}
```

#### Possible Changes

In order to validate that the Heatwave update works correctly, the following should be checked. These are the only values that can change from a template render.

- Attributes
    + native attributes
    + `data-*` attributes
- Text Content (inner content of a tag)
- Deleting nodes
- Adding nodes

### Updating internal reference

For reasons that are outside of this readme, there is a case when the internal Heatwave element reference (`this._realElement`) might get out-of-date from that in the DOM. However, you don't want to re-initialize Heatwave because the time it takes to re-add all the attributes. For this case, we expose a function `reRef` to update the internal reference.

```javascript
heatwave.reRef(el);

// Actual internal implementation:
reRef(el) {
  this._realElement = el;
}
```

---

## Additional problems to solve

- Ignoring nodes
    + In Juno, we mark nodes with certain attributes as ignored from dom diffing (namely, child components). We need some mechanism to allow developers to ignore nodes from being walked by Heatwave.
- Mixed Text Nodes
    + It's possible to interweave text nodes and tags, which can cause some issues as text nodes can't be assigned an ID. Generating the patchset for that node is therefore impossible. We'll need to figure out a strategy for re-rendering text nodes. We could find a heuristic to track them and do it naively, and then rely on text nodes being an edge case.