///////////////////////////////////////////////////////////////////////////
// ICRC, FULL CUSTOM WIDGET
// WEB APP BUILDER VERSION 2.6
// ADRIÁN PÉREZ BENEITO, GIS TEAM
///////////////////////////////////////////////////////////////////////////
define(['dojo/_base/declare', 
        'jimu/BaseWidget',
        'dojo/_base/lang',
        'dojo/dom-construct',
        'dojo/dom-style',
        'dojo/dom',
        'dojo/on', 
        'dijit/form/Button',
        'dijit/form/MultiSelect',
        'dijit/form/RadioButton',
        'dijit/ProgressBar',
        'dijit/Dialog',
        'esri/tasks/query',
        'esri/tasks/QueryTask',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/geometry/Point',
        'esri/Color',
        'esri/graphic',
        'esri/layers/FeatureLayer',
        'esri/geometry/Extent',
        'esri/SpatialReference',
        'esri/symbols/SimpleLineSymbol', 
        'dojo/domReady!'],
        function(declare, BaseWidget, lang, domConstruct, domStyle, dom, on,         
                 Button, MultiSelect, RadioButton, ProgressBar, Dialog, 
                 Query, QueryTask, SimpleMarkerSymbol, Point, Color, Graphic, FeatureLayer, Extent, SpatialReference, SimpleLineSymbol){

  return declare([BaseWidget], {
   
    /* selectR_domains: [],
    selectA_domains: [], */
    selectR_value: null,
    arrayAct: null,
    progressBar: null,
   

    startup: function(){
      this.getDomains()
      this.initProgressBar(); 
    },

    initProgressBar: function () {
      this.progressBar = new ProgressBar({
        indeterminate: true
      }, this.progressbarNode);
    
      domStyle.set(this.progressBar.domNode, 'display', 'none');
    },

    getDomains: function(){
     /* var fields = layerForFilterWidget.fields
     for(i in fields){
      if(fields[i].domain && fields[i].alias === 'DETENTION'){
        var coded = fields[i].domain.codedValues
        for(i in coded){
          this.selectR_domains.push(coded[i].code)
        }
      } else if(fields[i].domain && fields[i].alias === 'ICRC_ICRC_WORLD_ISO2_NAME'){
        var _coded = fields[i].domain.codedValues
        for(i in _coded){
          this.selectA_domains.push(_coded[i].code)
        }
      }
     } */
      this.mappingDomainsForSelect()
    },

    mappingDomainsForSelect: function(){
      /* 
      BE CAREFUL, ARROW FUNCTIONS PRESENTS (ES6), CHECK IF THE USERS WILL USE IE AND IF THE VERSION
      IS COMPATIBLE WITH ES6, if not => use Babel
      
      var mapSelectR = this.selectR_domains.map((record) => {
        return {
          label: record,
          value: record
        }
      })
      var mapSelectA = this.selectA_domains.map((record) => {
        return {
          label: record,
          value: record
        }
      }) */
      this.filtering()
    },

    filtering: function(){
     var regions = this.config.regionsMultiselect

     for (i in regions) {
         var opData = domConstruct.create('option')
             opData.innerHTML = regions[i]
             opData.value = regions[i]
         this.regionsNode.appendChild(opData)
     }
     new MultiSelect({
         name: 'regionsMultiS',
         id : 'regionsMultiS'
     }, this.regionsNode).startup()
     
     var activities = this.config.activitiesMultiselect
     var activitiesValues = this.appConfig.fieldsForGraphics

     for(i in activities){
         var opData = domConstruct.create('option')
             opData.innerHTML = activities[i]
             for(o in activitiesValues){
              opData.value = activitiesValues[i]
             }
         this.activitiesNode.appendChild(opData)
     } 
  
     new MultiSelect({
         name: 'activitiesMultiS',
         id : 'activitiesMultiS'
     }, this.activitiesNode).startup()

     /* 'selectR_value' & 'arrayAct' are filled before the selection 'cause IE, automatically, 'selects' the first value of the Dojo's 
     multiselect; IE only highlights the first value in color blue; so the user thinks that tha value is already selected, but not really.
     In other browsers there isn't any automatically highlighted value at the Dojo's multiselects... */
     this.selectR_value = [this.config.regionsMultiselect[0]];
     var self = this;
     dijit.byId('regionsMultiS').on("click", function(){
       self.selectR_value = this.get("value")
     })

     this.arrayAct = [this.appConfig.fieldsForFilterICRC[0]];
     dijit.byId('activitiesMultiS').on("click", function(){
        self.arrayAct = this.get("value")
     }) 

     new Button({
        label: this.nls.submit,
        onClick: lang.hitch(this, function(){
          this.submitFilter();
        })
     }, this.submitbutton).startup();

     new Button({
      label: this.nls.resetFilter,
      onClick: lang.hitch(this, function(){
        this.resetFilter();
      })
     }, this.resetFilterbutton).startup();
    },

     submitFilter: function(){
      domStyle.set(this.progressBar.domNode, 'display', 'block');
      
      graphicsLayer.clear();
      var graphicsArray = []

      var query = new Query();
      var queryTask = new QueryTask(this.appConfig.actCountryCenterLayer);
      query.where = '1=1';
      query.outFields = this.appConfig.fieldsForFilterICRC;
      query.returnGeometry = true;
      queryTask.execute(query, lang.hitch(this, function(results){
        for (i = 0; i < results.features.length; ++i) {
          var points = new Point(results.features[i].geometry);
            
          var check = results.features[i].attributes;

          var _I1 = check.XXXX;
          var _I2 = check.XXXX;
          var _I3 = check.XXXX;
          var _I4 = check.XXXX;
          var _I5 = check.XXXX;
          var _I6 = check.XXXX;
          var continents = check.continentRegions;
    
          var arrayCheck = [];

          switch(true){
            case true:
            if(this.arrayAct.indexOf('XXXX') > -1){
              arrayCheck.push(_I1);
            } else{
              arrayCheck.push(null);
            }
            case true:
            if(this.arrayAct.indexOf('XXXX') > -1){
              arrayCheck.push(_I2);
            } else{
              arrayCheck.push(null);
            }
            case true:
            if(this.arrayAct.indexOf('XXXX') > -1){
              arrayCheck.push(_I3);
            } else{
              arrayCheck.push(null);
            }
            case true:
            if(this.arrayAct.indexOf('XXXX') > -1){
              arrayCheck.push(_I4);
            } else{
              arrayCheck.push(null);
            }
            case true:
            if(this.arrayAct.indexOf('XXXX') > -1){
              arrayCheck.push(_I5);
            } else{
              arrayCheck.push(null);
            }
            case true:
            if(this.arrayAct.indexOf('XXXX') > -1){
              arrayCheck.push(_I6);
            } else{
              arrayCheck.push(null);
            }
          }
        
          var size = arrayCheck.filter(function(value){ 
              return value !== null && value.length > 1 && value !== 'null' && value !== undefined;
          }).length;

          var _symbol = new SimpleMarkerSymbol({
            'color': eval(this.appConfig.graphicsColor),
            'size': size * 10,
            'angle': 0,
            'xoffset': 0,
            'yoffset': 0,
            'type': 'esriSMS',
            'style': 'esriSMSCircle',
            'outline': {
              'type': 'esriSLS',
              'style': 'esriSLSSolid'
            }
          });

          var attributesContinents = {
            'continent': continents,
            'numberActivities': size
          }

          var pointGraphic = new Graphic(points, _symbol.setOutline(new SimpleLineSymbol()
                                                        .setWidth(this.appConfig.graphicsOutlineWidth)
                                                        .setColor(eval(this.appConfig.graphicsOutlineColor))), attributesContinents);

          graphicsArray.push(pointGraphic);
      }
      })).then(lang.hitch(this, function(){
        for (i = 0; i < graphicsArray.length; ++i) {
          graphicsLayer.add(graphicsArray[i])
        }
      })).then(lang.hitch(this, function(){
        var arrayContinents = [];

        for (i = 0; i < graphicsLayer.graphics.length; ++i) {
          arrayContinents.push(graphicsLayer.graphics[i])
        }

        var continentFiltering = arrayContinents.map(lang.hitch(this, function(record){
          graphicsLayer.clear();
          if(this.selectR_value[0] === 'Africa'){
            if(record.attributes.continent === 'Africa'){
              return record
            } else{
              //Do nothing
            }
          } else if(this.selectR_value[0] === 'Americas'){
            if(record.attributes.continent === 'Americas'){
              return record
            } else{
              //Do nothing
            }
          } else if(this.selectR_value[0] === 'Asia'){
            if(record.attributes.continent === 'Asia'){
              return record
            } else{
              //Do nothing
            }
          } else if(this.selectR_value[0] === 'Europe'){
            if(record.attributes.continent === 'Europe'){
              return record
            } else{
              //Do nothing
            }
          }
        }))

        var notNullContinentFiltering = continentFiltering.filter(function(value){ 
          return value !== undefined
        }); 
  
        //The next blucle and conditional allow the widget to filter the activities by 'AND', now using 'OR'
        /*var compare = [];
        for (i = 0; i < notNullContinentFiltering.length; ++i) {
          if(notNullContinentFiltering[i].attributes.numberActivities === self.arrayAct.length){
            compare.push(notNullContinentFiltering[i])
          } 
        } 

        if(compare.length == 0){
          domStyle.set(self.progressBar.domNode, 'display', 'none');
          new Dialog({
            title: 'GISupport says:',
            content: 'There are no data with that combination',
            style: 'width: 300px'
          }).show();
        }*/
     
        for (i = 0; i < notNullContinentFiltering.length; ++i) {
          graphicsLayer.add(notNullContinentFiltering[i]);
        } 
      })).then(lang.hitch(this, function(){
        if(graphicsLayer.graphics[0].attributes.continent === 'Africa'){
          this.map.setExtent(new Extent(this.config.regionsExtent.AfricasExtent));
        } else if(graphicsLayer.graphics[0].attributes.continent === 'Americas'){
          this.map.setExtent(new Extent(this.config.regionsExtent.AmericasExtent));
        } else if(graphicsLayer.graphics[0].attributes.continent === 'Asia'){
          this.map.setExtent(new Extent(this.config.regionsExtent.AsiasExtent));
        } else if(graphicsLayer.graphics[0].attributes.continent === 'Europe'){
          this.map.setExtent(new Extent(this.config.regionsExtent.EurasiasExtent));
        }
      })).then(lang.hitch(this, function(){
        domStyle.set(this.progressBar.domNode, 'display', 'none');
      }))
    },

    resetFilter: function(){
      graphicsLayer.clear();

      var graphicsArray = []

      var query = new Query();
      var queryTask = new QueryTask(this.appConfig.actCountryCenterLayer);
      query.where = '1=1';
      query.outFields = this.appConfig.fieldsForGraphics;
      query.returnGeometry = true;
      queryTask.execute(query, lang.hitch(this, function(results){
        for (i = 0; i < results.features.length; ++i) {
          var points = new Point(results.features[i].geometry)
          var check = results.features[i].attributes;

          var _I1 = check.ICRC_ICRC_ICRC_PROT_Migration_2
          var _I2 = check.ICRC_ICRC_ICRC_PROT_Migration_4
          var _I3 = check.ICRC_ICRC_ICRC_PROT_Migration_8
          var _I4 = check.ICRC_ICRC_ICRC_PROT_Migratio_10
          var _I5 = check.ICRC_ICRC_ICRC_PROT_Migratio_12
          var _I6 = check.ICRC_ICRC_ICRC_PROT_Migratio_16

          var arrayCheck = new Array(_I1, _I2, _I3, _I4, _I5, _I6)

          var size = arrayCheck.filter(function(value){ 
              return value !== null && value.length > 1 && value !== 'null' && value !== undefined;
          }).length; 
        
          var _symbol = new SimpleMarkerSymbol({
            'color': eval(this.appConfig.graphicsColor),
            'size': size * 10,
            'angle': 0,
            'xoffset': 0,
            'yoffset': 0,
            'type': 'esriSMS',
            'style': 'esriSMSCircle',
            'outline': {
              'type': 'esriSLS',
              'style': 'esriSLSSolid'
            }
          });

          var pointGraphic = new Graphic(points, _symbol.setOutline(new SimpleLineSymbol()
                                                        .setWidth(this.appConfig.graphicsOutlineWidth)
                                                        .setColor(eval(this.appConfig.graphicsOutlineColor))));

          graphicsArray.push(pointGraphic);
        }
      })).then(lang.hitch(this, function(){
        for (i = 0; i < graphicsArray.length; ++i) {
          graphicsLayer.add(graphicsArray[i])
        }
      })).then(lang.hitch(this, function(){
        this.map.setExtent(new Extent(this.config.regionsExtent.resetExtent));
      }))
    }
 })
})
