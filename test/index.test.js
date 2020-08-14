import {Heatwave} from '../src/heatwave'

const expect = require('chai').expect
const parse = require('./parse')

describe('Heatwave', function() {
  it('should be a function', function() {
    expect(Heatwave).to.be.a('function')
  })
  it('should construct with a valid DOM element', function() {
    function noArgs() {
      new Heatwave()
    }
    function validElement() {
      new Heatwave(parse(`<div></div>`))
    }
    function invalidElement() {
      new Heatwave('div')
    }
    expect(noArgs).to.throw()
    expect(validElement).to.not.throw()
    expect(invalidElement).to.throw()
  })

  describe('Heatwave Constructor', function() {
    let heatwave
    let el
    beforeEach(function() {
      el = parse(`
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
      `)
      heatwave = new Heatwave(el)
    })
    it('should store the element as _realElement', function() {
      expect(heatwave._realElement).to.equal(el)
    })
    it('should clone the node and store it as _el', function() {
      expect(heatwave._el.getAttribute('data-heatwaveid')).to.equal('0')
      expect(heatwave._el).to.not.equal(el)
    })

    describe('data-heatwaveid', function() {
      it('should add `data-heatwaveid` attribute to all nodes', function() {
        const els = el.querySelectorAll('div')
        for (let i = 0; i < els.length; i++) {
          expect(els[i].getAttribute('data-heatwaveid')).to.equal('0.1.0')
        }
      })
      it('should add the correct heatwave IDs', function() {
        expect(el.getAttribute('data-heatwaveid')).to.equal('0')
        for (let i = 0; i < el.children.length; i++) {
          expect(el.children[i].getAttribute('data-heatwaveid')).to.equal('0.' + i)
        }
      })
      it('should respect keyed values', function() {
        const newEl = parse('<div key="test"><div></div><div key="delucchi"></div></div>')
        new Heatwave(newEl)
        expect(newEl.getAttribute('data-heatwaveid')).to.equal('$test')
        expect(newEl.children[0].getAttribute('data-heatwaveid')).to.equal('$test.0')
        expect(newEl.children[1].getAttribute('data-heatwaveid')).to.equal('$test.$delucchi')
      })
    })

    describe('Heatwave#reRef', () => {
      it('should update the internal _realElement reference', () => {
        const newEl = parse('<div></div>')
        heatwave.reRef(newEl)
        expect(heatwave._realElement).to.equal(newEl)
        expect(heatwave._el).to.not.equal(newEl)
      })
      it('should return `this`', () => {
        const ref = heatwave.reRef()
        expect(ref).to.equal(heatwave)
      })
    })

    describe('Heatwave#update', () => {
      let heatwave
      let el
      beforeEach(() => {
        el = parse(`
          <div class="first" data-test="broken" dir="ltr">Text Content</div>
        `)
        heatwave = new Heatwave(el)
      })

      it('should update attributes when they are set', () => {
        const newEl = el.cloneNode(true)
        newEl.setAttribute('dir', 'rtl')
        heatwave.update(newEl)
        expect(el.getAttribute('dir')).to.equal('rtl')
      })

      it('should update data attributes when they are set', () => {
        const newEl = el.cloneNode(true)
        newEl.setAttribute('data-test', 'working')
        heatwave.update(newEl)
        expect(el.getAttribute('data-test')).to.equal('working')
      })

      it('should update the class property correctly via className', () => {
        const newEl = el.cloneNode(true)
        newEl.setAttribute('class', 'second')
        heatwave.update(newEl)
        expect(el.className).to.equal('second')
      })

      it('should change the text content when it is updated', () => {
        const newEl = el.cloneNode(true)
        newEl.textContent = 'Second Value'
        heatwave.update(newEl)
        expect(el.textContent).to.equal('Second Value')
      })
    })

    describe('Heatwave Nodes Changes', () => {
      let heatwave
      let el
      let newEl

      beforeEach(() => {
        el = parse(`
          <div>
            <span class="removeme">First Value</span>
            <section>
              <article class="container">
              </article>
            </section>
          </div>
        `)
        newEl = el.cloneNode(true)
        heatwave = new Heatwave(el)
      })

      it('should add nodes', () => {
        expect(el.querySelector('.container').children.length).to.equal(0)
        newEl.querySelector('.container').appendChild(parse(`
          <div data-hello="world" class="test">Hello World</div>`))
        heatwave.update(newEl)
        const children = el.querySelector('.container').children
        expect(children.length).to.equal(1)
        expect(children[0].tagName.toLowerCase()).to.equal('div')
        expect(children[0].textContent).to.equal('Hello World')
        expect(children[0].getAttribute('data-hello')).to.equal('world')
        expect(children[0].className).to.equal('test')
      })

      it('should add nodes and update text and attributes in one update', () => {
        newEl.querySelector('.removeme').textContent = 'Second Value'
        newEl.querySelector('.removeme').setAttribute('data-test', 'working')
        newEl.querySelector('.container').appendChild(parse(`<span>hello</span>`))
        heatwave.update(newEl)
        expect(el.querySelector('.removeme').textContent).to.equal('Second Value')
        expect(el.querySelector('.removeme').getAttribute('data-test')).to.equal('working')
        expect(el.querySelector('.container').children.length).to.equal(1)
      })

      it('should add multiple nodes', () => {
        newEl.querySelector('.container').appendChild(parse(`<span>first</span>`))
        newEl.querySelector('.container').appendChild(parse(`<div>second</div>`))
        newEl.querySelector('.container').appendChild(parse(`<button>third</button>`))
        heatwave.update(newEl)
        const children = el.querySelector('.container').children
        expect(children.length).to.equal(3)
        expect(children[0].tagName.toLowerCase()).to.equal('span')
        expect(children[0].textContent).to.equal('first')
        expect(children[1].tagName.toLowerCase()).to.equal('div')
        expect(children[1].textContent).to.equal('second')
        expect(children[2].tagName.toLowerCase()).to.equal('button')
        expect(children[2].textContent).to.equal('third')
      })

      it('should add a correct data-heatwaveid to all new elements', () => {
        newEl.querySelector('.container').appendChild(parse(`<div><span></span><section></section></div>`))
        newEl.querySelector('.container').appendChild(parse(`<article></article>`))
        heatwave.update(newEl)
        const children = el.querySelector('.container').children
        expect(children[0].getAttribute('data-heatwaveid')).to.equal('0.1.0.0')
        expect(children[0].children[0].getAttribute('data-heatwaveid')).to.equal('0.1.0.0.0')
        expect(children[0].children[1].getAttribute('data-heatwaveid')).to.equal('0.1.0.0.1')
        expect(children[1].getAttribute('data-heatwaveid')).to.equal('0.1.0.1')
      })

      it('should add a correct data-heatwaveid to new keyed elements', () => {
        newEl.querySelector('.container').appendChild(parse(`<div key="div"><span key="test"></span><section></section></div>`))
        newEl.querySelector('.container').appendChild(parse(`<article key="second"></article>`))
        heatwave.update(newEl)
        const children = el.querySelector('.container').children
        expect(children[0].getAttribute('data-heatwaveid')).to.equal('0.1.0.$div')
        expect(children[0].children[0].getAttribute('data-heatwaveid')).to.equal('0.1.0.$div.$test')
        expect(children[0].children[1].getAttribute('data-heatwaveid')).to.equal('0.1.0.$div.1')
        expect(children[1].getAttribute('data-heatwaveid')).to.equal('0.1.0.$second')
      })

      it('should remove nodes', () => {
        newEl.querySelector('.removeme').remove()
        heatwave.update(newEl)
        expect(el.querySelector('.removeme')).to.equal(null)
        expect(el.querySelector('section').getAttribute('data-heatwaveid')).to.equal('0.0')
        expect(el.children.length).to.equal(1)
      })

      it('should re-id nodes', () => {
        newEl.querySelector('.removeme').remove()
        heatwave.update(newEl)
        expect(el.children[0].getAttribute('data-heatwaveid')).to.equal('0.0')
      })
    })
  })
})
