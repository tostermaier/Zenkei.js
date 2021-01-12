/**
 * zenkei.js (Japanese 前景, German: Vordergrund) is a tool implement micro frontends
 *  
 * @version 0.5
 * @developer Timm Ostermaier
 * @license MIT
 */
class Zenkei {

    /**
     * stores registered frontend in a map
     * <url, frontend> 
     */
    registeredFrontends = new Map();
    registeredCommunicationEvents = [];

    constructor() {

    }

    /**
     * register a new frontend  
     */
    register(url, elements, elementToAppend) {
        let frontend = new MicroFrontend(url, elements, elementToAppend);
        this.registeredFrontends.set(url, frontend);

        return frontend;
    }

    /**
     * render a frontend
     * @param frontend to render 
     */
    render(frontend) {
        frontend.render();
    }

    /**
     * 
     * @param url to request frontend
     * @param elementToAppend add micro frontend to that element
     */
    initFrontend(url, elementToAppend) {
        console.debug("render frontend for", url);
        this.requestFrontend(url)
            .then((data) => {
                this.render(this.register(url, data, elementToAppend))
            }).catch((error) => {
                console.error("error in initFrontend(), error: ", error);
            });
    }

    /**
     * request frontend from server
     * @param url to request frontend
     */
    requestFrontend(url) {

        return new Promise((resolve, reject) => {

            let request = new XMLHttpRequest(url);
            request.open("GET", url, true);

            request.onload = () => {
                if (request.readyState == 4 && request.status == 200) {
                    resolve(request.responseText);
                } else {
                    reject("error")
                    console.warn("requesting frontend failed", this)
                }
            }
            request.send();
        })
    }

    /**
     * register communication event for cross micro frontend communication
     * @param {*} eventName : name (string) for event
     * @param {*} eventFunction  : function to register
     */
    registerCommunicationEvent(eventName, eventFunction) {

        try {
           this.registeredCommunicationEvents[eventName] = eventFunction;
        } catch (e) {
            console.error(
                "error in registering communication function", eventFunction,
                "Error", e)
        }

    }

    executeCommunicationEvent(event, ...n) {

        console.log("executeCommunicationEvent()", event)
        try {

            if (this.registeredCommunicationEvents[event] != null) {
                this.registeredCommunicationEvents[event](n);
            }
        } catch (e) {
            console.error(
                "error in execution of", event,
                "Error", e);
        }
    }

}

/**
 * class for a specifc frontend part
 */
class MicroFrontend extends HTMLElement {

    htmlElementsString = "";
    htmlElementsDom = [];
    url = "";
    parser = new DOMParser();
    microFrontend = null;
    initScripts = null;

    communicationFunctions = []

    constructor(url, elements, elementToAppend) {
        super();
        this.url = url;
        this.htmlElementsString = elements;
        this.parseToHtml(this.htmlElementsString);
        this.rootElement = elementToAppend;
    }

    /**
     * create micro-frontend dom node and renders childs element into them
     */
    render() {
        this.innerHTML = this.htmlElementsString;
        this.rootElement.appendChild(this);
        this.createScript();
    }

    /**
     * parse htmlString to HTMl-Document
     */
    parseToHtml() {
        this.htmlElementsDom = this.parser.parseFromString(this.htmlElementsString, 'text/html');
    }

    connectedCallback() {
        console.log("connect frontend")
    }

    /**
     * enable micro frontend scripts
     */
    createScript() {
        if (this.htmlElementsDom.getElementsByClassName("microfrontend_script") != null) {

            for (let el of this.htmlElementsDom.getElementsByClassName("microfrontend_script")) {
                let script = document.createElement("script")
                script.setAttribute("type", 'module');
                script.src = el.src;
                this.appendChild(script);
            }
        }

    }

}

window.customElements.define('micro-frontend', MicroFrontend);