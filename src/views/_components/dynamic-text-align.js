import {inject, BindingEngine} from 'aurelia-framework'
import {UserDetails} from 'common'

class AbstractDynamicTextAligner {
    constructor(element, bindingEngine, userDetails, supportedLanguages, textAlignement) {
        if (supportedLanguages.includes(userDetails.language)) {
            element.style.textAlign = textAlignement;
        }
        bindingEngine
            .propertyObserver(userDetails, 'language')
            .subscribe((newLanguage) => {
                if (supportedLanguages.includes(newLanguage)) {
                    element.style.textAlign = textAlignement;
                }
            });
    }
}

@inject(Element, BindingEngine, UserDetails)
export class LtrLeftCustomAttribute extends AbstractDynamicTextAligner {

    constructor(element, bindingEngine, userDetails) {
        super(element, bindingEngine, userDetails, ["en", "fr"], "left");
    }
}

@inject(Element, BindingEngine, UserDetails)
export class LtrRightCustomAttribute extends AbstractDynamicTextAligner {

    constructor(element, bindingEngine, userDetails) {
        super(element, bindingEngine, userDetails, ["en", "fr"], "right");
        console.log(element);
    }
}

@inject(Element, BindingEngine, UserDetails)
export class RtlLeftCustomAttribute extends AbstractDynamicTextAligner {

    constructor(element, bindingEngine, userDetails) {
        super(element, bindingEngine, userDetails, ["prs", "ar"], "left");
        console.log(element);
    }
}

@inject(Element, BindingEngine, UserDetails)
export class RtlRightCustomAttribute extends AbstractDynamicTextAligner {

    constructor(element, bindingEngine, userDetails) {
        super(element, bindingEngine, userDetails, ["prs", "ar"], "right");
    }
}