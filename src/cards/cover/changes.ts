import { 
    getName, 
    getState, 
    getAttribute, 
    getIcon, 
    applyScrollingEffect,
    getWeatherIcon,
    setLayout
} from "../../tools/utils.ts";
import { initializesubButtonIcon } from '../../tools/global-changes.ts';

export function changeIcon(context) {
  const stateObj = context._hass.states[context.config.entity];
  const iconOpen = context.config.icon_open;
  const iconClosed = context.config.icon_close;
  const isOpen = getState(context) !== 'closed';
  const currentPosition = stateObj.attributes.current_position;
  const assumedState = stateObj.attributes.assumed_state;
  const isFullyOpen = assumedState && !currentPosition ? false : currentPosition ? currentPosition === 100 : isOpen;
  const isFullyClosed = assumedState && !currentPosition ? false : currentPosition ? currentPosition === 0 : !isOpen;
  const isCurtains = getAttribute(context, 'device_class') === 'curtain';

  context.elements.icon.icon = isOpen ? 
    getIcon(context, context.config.entity, context.config.icon_open) :
    getIcon(context, context.config.entity, context.config.icon_close);
  context.elements.iconOpen.icon = context.config.icon_up || (isCurtains ? "mdi:arrow-expand-horizontal" : "mdi:arrow-up");
  context.elements.iconClose.icon = context.config.icon_down || (isCurtains ? "mdi:arrow-collapse-horizontal" : "mdi:arrow-down");

  if (isFullyOpen) {
    context.elements.buttonOpen.classList.add('disabled');
  } else {
    context.elements.buttonOpen.classList.remove('disabled');
  }

  if (isFullyClosed) {
    context.elements.buttonClose.classList.add('disabled');
  } else {
    context.elements.buttonClose.classList.remove('disabled');
  }
}
export function changeName(context) {
    const name = getName(context);
    if (name !== context.elements.previousName) {
      context.elements.name.innerText = name;
      applyScrollingEffect(context, context.elements.name, name);
      context.elements.previousName = name;
  }
}
export function changeStyle(context) {
    initializesubButtonIcon(context);
    setLayout(context);

    if (!context.config.styles) return;

    const state = getState(context);

    let customStyle = '';

    try {
        customStyle = context.config.styles
            ? Function('hass', 'entity', 'state', 'icon', 'subButtonIcon', 'getWeatherIcon', 'card', `return \`${context.config.styles}\`;`)
              (context._hass, context.config.entity, state, context.elements.icon, context.subButtonIcon, getWeatherIcon, context.card)
            : '';
    } catch (error) {
        throw new Error(`Error in generating cover custom templates: ${error.message}`);
    }

    if (context.elements.customStyle) {
        context.elements.customStyle.innerText = customStyle;
    }
}


  
