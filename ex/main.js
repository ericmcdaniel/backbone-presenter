const { componentRenderer, chunk, configureRenderer } = backboneComponentRenderer;

configureRenderer({ backbone: window.Backbone });

const factory = (Ctor) => (...args) => create(Ctor, ...args);
const create = (Ctor, ...args) => new Ctor(...args);

const View = Backbone.View.extend({
  initialize() {
    this.renderer = componentRenderer(this);
    _.bindAll(this, 'renderer');
  },
  remove() {
    Backbone.View.prototype.remove.call(this);
  }
});

const Link = factory(View.extend({
  tagName: 'a',
  initialize(options) {
    this.link = options.link;
    View.prototype.initialize.call(this);
  },
  render() {
    const { url, text } = this.link;
    this.el.href = url;
    // Render any value directly:
    this.renderer(text);
  },
  remove() {
    console.log('Deeply nested child view was removed.');
    View.prototype.remove.call(this);
  }
}));

const Nav = factory(View.extend({
  tagName: 'nav',
  links: [
    { url: '#/home', text: 'Home' },
    { url: '#/about', text: 'About' }
  ],
  render() {
    // Embed iterables that can contain any value (chunk in this example):
    const links = this.links.map(link => chunk`<li>${Link({ link })}</li>`);
    this.renderer`
      <ul>${links}</ul>
    `;
  }
}));

const UserInfo = factory(View.extend({
  className: 'UserInfo',
  render() {
    const { name, age } = this.model.toJSON();
    this.renderer`
      <dl>
        <dt>Name</dt>
        <dd>${name}</dd>
        <dt>Age</dt>
        <dd>${age}</dd>
      </dl>
    `;
  }
}));

const Header = factory(View.extend({
  tagName: 'header',
  render() {
    const { links } = this;
    this.renderer`
      ${Nav()}
    `;
  }
}));

const Footer = factory(View.extend({
  tagName: 'footer',
  render() {
    const { links } = this;
    this.renderer`
      ${Nav()}
      <p>Have a nice day.</p>
    `;
  }
}));

const App = factory(View.extend({
  className: 'App',
  render() {
    const { links, collection } = this;
    // Views that render multiple children:
    this.renderer`
      ${Header()}
      <main>
        <h2>Backbone Component Renderer</h2>
        <p>Renderer is a really bad word, isn't it?</p>
        ${collection.map(model => UserInfo({ model }))}
      </main>
      ${Footer()}
    `;
  }
}));

const users = new Backbone.Collection([
  { name: 'Walt', age: 50 },
  { name: 'Hank', age: 43 },
  { name: 'Jessie', age: 25 }
]);

const app = App({ collection: users });

app.render();

document.body.appendChild(app.el);
window.app = app;