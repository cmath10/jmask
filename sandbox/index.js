import JMask from '../src/jmask';

(() => {
  const masks = [
    {id: 'money', mask: '#.##0,00', options: {reverse: true}},
    {id: 'phone', mask: '+7-000-000-00-00'},
  ].map(({id, mask, options}) => {
    const el = document.getElementById(id);
    return new JMask(el, mask, options);
  });

  window.addEventListener('beforeunload', () => {
    masks.forEach(mask => {
      mask.destroy();
    });
  });
})();
