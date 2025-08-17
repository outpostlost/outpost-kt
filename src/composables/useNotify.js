// src/composables/useNotify.js
export default function useNotify() {
  const success = (message, options = {}) => {
    console.log('SUCCESS:', message);
  };

  const error = (message, options = {}) => {
    console.error('ERROR:', message);
  };

  const info = (message, options = {}) => {
    console.log('INFO:', message);
  };

  const warning = (message, options = {}) => {
    console.warn('WARNING:', message);
  };

  const component = (vueComponent, componentProps = {}, options = {}) => {
    console.log('COMPONENT TOAST:', componentProps);
  };

  const clearAll = () => {
    console.log('CLEAR ALL TOASTS');
  };

  return {
    success,
    error,
    info,
    warning,
    component,
    clearAll,
  };
}