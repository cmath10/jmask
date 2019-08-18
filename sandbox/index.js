import JMask from '../src/jmask';

(() => {
  const el = document.getElementById('phone');
  const mask = JMask.attachTo(el);

  window.addEventListener('beforeunload', () => {
    mask.destroy();
  });
})();
