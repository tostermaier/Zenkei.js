/**
 * zenkei.js (Japanse 前景, German: Vordergrund) is a tool to create easy micro frontend applications
 * 
 * @version 0.1
 * @developer Timm Ostermaier
 * @license MIT
 */
class Zenkei {

    /**
     * stores registered frontend in a map
     * <url, frontend> 
     */
    registeredFrontends = new Map();

    constructor() {

    }

    /**
     * register a new frontend  
     */
    register(url, elements, elementToAppend) {
        let frontend = new Frontend(url, elements, elementToAppend);
        this.registeredFrontends.set(url, frontend);
        
        return frontend;
    }

    render(frontend){
        frontend.render();
    }

    initFrontend(url,elementToAppend){
        this.requestFrontend(url)
        .then((data) => {
            this.render(   this.register(url,data, elementToAppend))
        }).catch((error) => {
            console.log(error);
        });
    }

    requestFrontend(url) {

       return new Promise((resolve, reject) => {

            let request = new XMLHttpRequest(url);
            request.open("GET", productAddress, true);

            request.onload = () => {
                if (request.readyState == 4 && request.status == 200) {
                    resolve(request.responseText);
                } else {
                    reject("error")
                    console.warn("requesting frontend failed",this)
                }
            }
            request.send();
        })
    }
}

/**
 * class for a specifc frontend part
 */
class Frontend {

    htmlElementsString = "";
    htmlElementsDom = [];
    url = "";
    parser = new DOMParser();
    
    constructor(url, elements, elementToAppend) {
        this.url = url;
        this.htmlElementsString = elements;
        this.parseToHtml(this.htmlElementsString);
        this.rootElement = elementToAppend;
    }

    render() {
        this.rootElement.appendChild(this.htmlElementsDom.documentElement)
    }  

    parseToHtml(){
        this.htmlElementsDom = this.parser.parseFromString(this.htmlElementsString,'text/html');
    }
}
