export class Heatwave {

  constructor(el) {
    if (!this._isElement(el)) {
      throw new Error('valid DOM element required')
    }

    const rootID = this._setRoot(el)
    this._realElement = el
    this._generateIds(el, rootID)
    this._el = el.cloneNode(true)
  }

  _setRoot(el) {
    const key = el.getAttribute('key')
    const id = (key ? '$' + key : '0')
    el.setAttribute('data-heatwaveid', id)
    return id
  }

  /**
   * Generate data-heatwaveid's for all child elements
   */

  _generateIds(el, rootID) {
    let id
    let key
    let child
    for (let i = 0; i < el.children.length; i++) {
      child = el.children[i]
      // respect nodes with keys
      if (child.hasAttribute('key')) {
        key = child.getAttribute('key')
      }
      id = rootID + '.' + (key ? '$' + key : i)
      // set updated id
      child.setAttribute('data-heatwaveid', id)
      // traverse sub tree recursively
      if (child.children.length > 0) {
        this._generateIds(child, id)
      }
    }
  }

  /**
   * Update the real DOM with new diff patches
   * Reset cloned node and update internal reference
   */

  update(newNode) {
    const patches = this._traverse(this._el, newNode)
    this._apply(patches, this._realElement)
    this._el = newNode
  }

  /**
   * Generate correct id for an element during traversal
   */

  _idEl(el, rootID, i = 0) {
    if (!el) {
      return
    }
    let newID = ''
    let key

    if (rootID) {
      newID = rootID + '.'
    }

    if (el.hasAttribute('key')) {
      key = el.getAttribute('key')
    }

    newID += (key ? '$' + key : i)
    el.setAttribute('data-heatwaveid', newID)
    return newID
  }

  /**
   *  Generate deep id - used for replace patches
   */

  _deepID(el, rootID) {
    for (let i = 0; i < el.children.length; i++) {
      this._idEl(el.children[i], rootID, i)
      this._deepID(el.children[i], rootID, i)
    }
  }

  /**
   * Traverse internal cloned node tree and diff each child
   */

  _traverse(a, b, rootID, idx) {
    rootID = this._idEl(b, rootID, idx)

    const aKey = a && a.getAttribute('data-heatwaveid')
    const bKey = b && b.getAttribute('data-heatwaveid')
    let patchArray = []

    if (a === undefined) {
      // new element update has one more node than current dom element
      // re-generate id's for the node and all of its children
      // diff and create 'insert' patch - push it to patchArray
      this._deepID(b, rootID, idx)
      patchArray.push(this._diffInsert(b, b.nextElementSibling, b.parentNode))
    } else if (b === undefined) {
      // new element update has one less node than current dom element
      // diff and create 'remove' patch - push it to patchArray
      patchArray.push(this._diffRemove(a))
    } else if (a.tagName === b.tagName && aKey === bKey) {
      // new element update matches the current dom element
      // diff and create 'attributes' patch - concat to patchArray
      patchArray = patchArray.concat(this._diffAttributes(a, b, bKey))
      const aLen = a.children.length
      const bLen = b.children.length
      const treeLength = aLen > bLen ? aLen : bLen
      // for the length of the longest tree, traverse the tree
      for (let i = 0; i < treeLength; i++) {
        patchArray = patchArray.concat(this._traverse(a.children[i], b.children[i], rootID, i))
      }
    } else {
      // new element update doesn't match current dom element
      // re-generate id's, create 'replace' patch for patchArray
      this._deepID(b, rootID, idx)
      patchArray.push(this._diffReplace(a, b))
    }
    return patchArray
  }

  /**
   * Generate a patch for node replacement
   */

  _diffReplace(a, node) {
    return {
      type: 'replace',
      id: a.getAttribute('data-heatwaveid'),
      node
    }
  }

  /**
   * Generate a patch for node removal
   */

  _diffRemove(node) {
    return {
      type: 'remove',
      id: node.getAttribute('data-heatwaveid')
    }
  }

  /**
   * Generate a patch for node insertion
   */

  _diffInsert(node, next, parent) {
    return {
      type: 'insert',
      id: parent.getAttribute('data-heatwaveid'),
      options: {
        node, next, parent
      }
    }
  }

  /**
   * Generate patches for child node attributes
   */

  _diffAttributes(a, b, id) {
    const aa = a.attributes
    const bb = b.attributes
    const patches = []

    for (let i = 0; i < aa.length; i++) {
      if (aa[i].value !== bb[i].value) {
        const patch = {
          type: 'attribute',
          id,
          options: {
            key: bb[i].nodeName,
            value: bb[i].value
          }
        }
        patches.push(patch)
      }
    }

    // generate text patch if node has text
    if (this._isText(a.firstChild)) {
      if (a.firstChild.nodeValue) {
        const patch = {
          type: 'text',
          id,
          text: b.firstChild.nodeValue
        }
        patches.push(patch)
      }
    }

    return patches
  }

  /**
   * Apply patches to the real DOM element
   */

  _apply(patches, realEl) {
    patches.forEach(patch => {
      let patchEl
      const type = patch.type
      const options = patch.options

      if (realEl.getAttribute('data-heatwaveid') === patch.id) {
        patchEl = realEl
      } else {
        patchEl = realEl.querySelector(`[data-heatwaveid="${patch.id}"]`)
      }

      if (type === 'insert') {
        if (options.next) {
          const child = patchEl.querySelector(`
            [data-heatwaveid="${options.next.getAttribute('data-heatwaveid')}]"`)
          patchEl.insertBefore(options.node, child)
        } else {
          patchEl.appendChild(options.node)
        }
      }

      if (type === 'remove') {
        patchEl.parentNode.removeChild(patchEl)
      }

      if (type === 'attribute') {
        patchEl.setAttribute(options.key, options.value)
      }

      if (type === 'text') {
        if (patchEl.firstChild.nodeValue) {
          patchEl.firstChild.nodeValue = patch.text
        }
      }

      if (type === 'replace') {
        patchEl.parentNode.replaceChild(patch.node, patchEl)
      }
    })
  }

  /**
   * Update internal Heatwave element reference
   */

  reRef(el) {
    this._realElement = el
    return this
  }

  /**
   * Validate nodeType is an Element
   */

  _isElement(o) {
    return Boolean(o && o.nodeType === 1)
  }

    /**
   * Validate nodeType is Text
   */

  _isText(o) {
    return Boolean(o && o.nodeType === 3)
  }

  /**
   * Validate nodeType is Comment
   */

  _isComment(o) {
    return Boolean(o && o.nodeType === 8)
  }

}
