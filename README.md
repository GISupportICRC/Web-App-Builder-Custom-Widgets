# :hospital: ICRC Web App Builder Custom Widgets

Web App builder Custom Widget List
- [ICRCFilterHealthActivities Widget](https://github.com/GISupportICRC/Web-App-Builder-Custom-Widgets#filter-widget-octocat)
- [ICRCFilterMigrantsActivities Widget](https://github.com/GISupportICRC/Web-App-Builder-Custom-Widgets/blob/master/README.md#icrcfiltermigrantsactivities-widget-mag)
- [IntroJS](https://github.com/GISupportICRC/Web-App-Builder-Custom-Widgets/blob/master/README.md#introjs-ft-wab-dizzy)


![.](https://icrc.maps.arcgis.com/sharing/rest/content/items/2cc6d61911724a3c835427436540bb32/data)
- HTML5, CSS3, JS
- [Dojo](https://dojotoolkit.org/reference-guide/1.10/dijit/index.html)
- Python
- jQuery
- [Yeoman](https://github.com/Esri/generator-esri-appbuilder-js) 


## ICRCFilterHealthActivities Widget :octocat:

Filtering Feature Layer using [Dojo CheckedMultiSelect](https://dojotoolkit.org/reference-guide/1.10/dojox/form/CheckedMultiSelect.html)

![.](https://icrc.maps.arcgis.com/sharing/rest/content/items/c5492ca6217041909d5a9023644f12e2/data)

***

## ICRCFilterMigrantsActivities Widget :mag:

Creating circle graphics and filtering them using [Dojo MultiSelect](https://dojotoolkit.org/reference-guide/1.10/dijit/form/MultiSelect.html)

![.](https://icrc.maps.arcgis.com/sharing/rest/content/items/0420817bc78a4f4f817533fbba189de4/data)

***

## IntroJS ft WAB :dizzy: 
### Why using [intro.js](https://introjs.com/)?
When new users visit your website or product you should demonstrate your product features using a step-by-step guide. Even when you develop and add a new feature to your product, you should be able to represent them to your users using a user-friendly solution. Intro.js is developed to enable web and mobile developers to create a step-by-step introduction easily.

![.](http://adri2c.maps.arcgis.com/sharing/rest/content/items/486a97c81a394212b4a059c80667f275/data)

### Integration with a Web App Builder app

**Add [intro.js dependencies](https://github.com/usablica/intro.js/#introjs-v290)** [How to add other libraries to WAB?](https://developers.arcgis.com/web-appbuilder/sample-code/add-a-third-party-library.htm)

**Create the configuration js file and refer to it in the application in the file 'index.html'**
Explore and get with the console the id/classes names of the containers to which you want to add as a step. Fill the 'intro' and 'position' options:
```
function getNode(node){
    //Getting ids or classes cleanly
    return document.querySelector(node);
}

function initIntro(){
    introJs().setOptions({
        steps: [{
                intro: "Hello Web App Builder, I'm IntroJS, wanna join me? :)"
            },
            {
                element: getNode('#widgets_Search_Widget_3'),
                intro: "The Search widget enables end users to find locations or search features on the map.",
                position: 'bottom'
            }
            .
            .
            .
        ]
    }).start();
}
```
**Call the 'initIntro' function**
Simply add a button that calls the function. For example, go to the 'HeaderController' widget:

- Add the button at the container (Widget.html):

```
<div class="container-section jimu-float-leading" data-dojo-attach-point="containerNode">
  <div data-dojo-attach-point="executeIntroJS"></div>
</div>
```

- Add a new function for contain the button and call it at 'startup' (Widget.js):

```
startup: function() {
  this.inherited(arguments);
  this.resize();
  setTimeout(lang.hitch(this, this.resize), 100);
  this.IntroJS();
},

IntroJS: function(){
  new Button({
      label: "INTRO JS",
      style: "position:absolute;top:5px;left:400px;",
      onClick: function(){
        initIntro()
      }
  }, this.executeIntroJS).startup();
},

```


***


