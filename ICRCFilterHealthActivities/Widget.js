///////////////////////////////////////////////////////////////////////////
// ICRC, FULL CUSTOM WIDGET
// WEB APP BUILDER VERSION 2.7
// ADRIÁN PÉREZ BENEITO, GIS TEAM
///////////////////////////////////////////////////////////////////////////
define(['dojo/_base/declare', 
        'jimu/BaseWidget',
        'dojo/_base/lang',
        'dojo/dom-construct',
        'dojo/dom-style',
        'dojo/dom', 
        'dojo/on',
        'dojo/Deferred',
        
        'esri/layers/FeatureLayer',
        'esri/tasks/query', 
        'esri/tasks/QueryTask',
        'esri/geometry/Extent',
        'esri/tasks/FeatureSet',
        'esri/symbols/SimpleMarkerSymbol', 
        'esri/symbols/PictureMarkerSymbol',
        'esri/Color', 
        'esri/renderers/SimpleRenderer',
        'esri/request',
        'esri/graphic',
        
        'dojox/form/CheckedMultiSelect',

        'dijit/form/Select',
        'dijit/form/Button',

        './clusterfeaturelayer',

        'jimu/dijit/LoadingShelter',
        'jimu/dijit/Message',
        'dojo/domReady!'],
function(declare, BaseWidget, lang, domConstruct, domStyle, dom, on, Deferred,
         FeatureLayer, Query, QueryTask,  Extent, FeatureSet, SimpleMarkerSymbol, PictureMarkerSymbol, Color, SimpleRenderer,  esriRequest, Graphic,  
         CheckedMultiSelect,
         Select, Button,
         ClusterFeatureLayer,
         LoadingShelter, Message) {
 
  return declare([BaseWidget], {

    activitiesLayer: null,
    activitiesLayerFiltered: null,
    country: null,
    type: null,
    _version: null,
    latestYear: [],
    countryExtent: [],
    thatWorldLayer: this,
    clusterLayer: null,
    shelter: null,

    startup: function() {
      this.inherited(arguments);
      this.getCountries();
      this.getVersion();
      this.initButtons();
      this.setExtent();
      this.removeClusterLayer();

      //Setting widget's panel width dynamically
      var panel = this.getPanel();
          panel.position.width = this.config.panelWidth;
          panel.setPosition(panel.position);
          panel.panelManager.normalizePanel(panel);

      this.shelter = new LoadingShelter({
        hidden: false
      });
      this.shelter.placeAt(this.loadingNode);
      this.shelter.startup();
      this.shelter.hide();

      /*for(var i = 0; i < this.map.graphicsLayerIds.length; i++) {
        var layerObject = this.map.getLayer(this.map.graphicsLayerIds[i]);
          if(layerObject.url = this.appConfig.activitiesUrl){
            layerObject.hide()
          } 
      }*/

      this.activitiesLayer = new FeatureLayer(this.appConfig.activitiesUrl, {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"],
        name: "ICRC Health Activities"
      }); 

      this.thatWorldLayer = new FeatureLayer(this.appConfig.worldUrl, {
        visible: false
      });
    },

    // Create a feature layer to get feature service
    addClusterLayer: function(type, sql){
      var query = '';
      if(type === 'initial'){
        query += "Version = '" + sql + "'"
      }else if(type === 'filtered'){
        query += sql
      }else if(type === 'All'){
        query += '1=1'
      }else{/* Do nothing */}

      this.clusterLayer = new ClusterFeatureLayer({
          "url": this.appConfig.activitiesUrl,
          "distance": 75,
          "where": query, 
          "id": "clusters",
          "labelColor": "#fff",
          "resolution": this.map.extent.getWidth() / this.map.width,
          "singleTemplate": null,
          "disablePopup": true,
          "useDefaultSymbol": false,
          "zoomOnClick": true,
          "showSingles": true,
          "objectIdField": "OBJECTID"
      });
      this.map.addLayer(this.clusterLayer);
      this.shelter.hide();
    },

    removeClusterLayer: function(){
      this.own(on(this.map, 'extent-change', lang.hitch(this, function(){
        if(this.map.getZoom() >= 8){
          if(this.clusterLayer){
            this.map.removeLayer(this.clusterLayer);
            this.activitiesLayer.show()
          }
        }else if(this.map.getZoom() < 8){
            this.map.addLayer(this.clusterLayer);
            this.activitiesLayer.hide()
        }
      })));
    },

    setExtent: function(){
      this.own(on(this.map, 'extent-change', lang.hitch(this, function(){
        if(this.map.getZoom() <= 2){
          this.setWorldExtent();
        }
      })));
    },

    setWorldExtent: function(){
      this.map.setExtent(new Extent(this.config.settingExtent));
    },

    getVersion: function(){
      var query = new Query();
          query.where = '1=1';
          query.returnGeometry = true;
          query.outFields = [this.config.getVersionFieldName];
          new QueryTask(this.appConfig.activitiesUrl).execute(query, lang.hitch(this, function(results){
            if(results.features && results.features.length > 0){
              var map = results.features.map(lang.hitch(this, function(record){
                return record.attributes[this.config.getVersionFieldName];
              }));
              var filter = map.filter(function(item, pos){
                return map.indexOf(item) == pos; 
              });

              this.initVersionSelect(filter);

              for(i in filter){
                this.latestYear.push(filter[i].slice(-4));
              }
            } 
          })).then(lang.hitch(this, function(){
            this.getFullLayer();
          })).then(lang.hitch(this, function(){
            this.getMultiSelect();
          })); 
    },

    getFullLayer: function(){
      this.shelter.show();
      var max = Math.max.apply(null, this.latestYear);  
      //Looking for the latest year and currents four-month periods, 'Q1-Q2' or 'Q3-Q4'; if 'Q1-Q2' features results = 0, get 'Q3-Q4 period'
      var layersRequest = esriRequest({
        url: this.appConfig.activitiesUrl + "/query?where=" + this.config.getVersionFieldName + "+%3D+%27" + 
             "Q1-Q2-" + max + "%27&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=Version&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson",
        content: { f: "json" },
        handleAs: "json",
        callbackParamName: "callback"
      })
      layersRequest.then(
        lang.hitch(this, function(results){
          console.log("Success");
          if(results.features.length === 0){
            var secondLayersRequest = esriRequest({
              url: this.appConfig.activitiesUrl + "/query?where=" + this.config.getVersionFieldName + "+%3D+%27" + 
                   "Q3-Q4-" + max + "%27&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=Version&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson",
              content: { f: "json" },
              handleAs: "json",
              callbackParamName: "callback"
            });
            secondLayersRequest.then(
              lang.hitch(this, function(results) {
                console.log("Success:");
                if(results.features.length != 0){
                  this.activitiesLayer.setDefinitionExpression(this.config.getVersionFieldName + " = 'Q3-Q4-" + max + "'");
                  this.map.addLayer(this.activitiesLayer);
                  this.latestVersion.innerHTML = 'Latest Version: Q3-Q4-' + max;
                  this.addClusterLayer('initial', 'Q3-Q4-' + max);
                }
            }), function(error) {
                console.log("Error");
            });
            secondLayersRequest.then(
              lang.hitch(this, function(){
                this.setWorldExtent();
              }))
          } else{ 
            this.activitiesLayer.setDefinitionExpression("Version = 'Q1-Q2-" + max + "'");
            this.map.addLayer(this.activitiesLayer);
            this.latestVersion.innerHTML = 'Latest Version: Q1-Q2-' + max;
            this.addClusterLayer('initial', 'Q1-Q2-' + max);
          }
      }), function(error){
          console.log("Error");
      });
      layersRequest.then(
        lang.hitch(this, function(){
          this.setWorldExtent();
      }));
      layersRequest.then(
        lang.hitch(this, function(){
          this.shelter.hide();
      }))
    },

    getCountries: function(){
      var query = new Query()
          query.where = '1=1'
          query.returnGeometry = true
          query.outFields = [this.config.getCountryFieldName]
          new QueryTask(this.appConfig.worldUrl).execute(query, lang.hitch(this, function(results){
            var map = results.features.map(lang.hitch(this, function(record){
              return record.attributes[this.config.getCountryFieldName]
            })).filter(Boolean);

            this.initCountrySelect(map)
          }))
    },

    getMultiSelect: function(){
      var query = new Query();
          query.where = '1=1';
          query.returnGeometry = true;
          query.outFields = [this.config.getMultiSelectFieldName];
          new QueryTask(this.appConfig.activitiesUrl).execute(query, lang.hitch(this, function(results){
            var map = results.features.map(lang.hitch(this, function(record){
              return record.attributes[this.config.getMultiSelectFieldName];
            }));
            var filter = map.filter(function(item, pos){
              return map.indexOf(item) == pos; 
            });
            this.initMultiSelect(filter);
          })) 
    },

    initCountrySelect: function(data){
      new Select({
        name: "countrySelector",
        id: "_countrySelector"
      }, this.selectNode).startup();
      
      var countriesMap = data.sort().map(function(record){
        return dojo.create("option", {
          label: record,
          value: record
        });
      });

      var countrySelect = dijit.byId("_countrySelector");
          countrySelect.addOption(countriesMap);
  
          this.country = countrySelect.value;

      this.own(on(countrySelect, 'change', lang.hitch(this, function(evt){
        this.country = evt;
      })));
    },

    initVersionSelect: function(data){
      new Select({
        name: "versionSelector",
        id: "_versionSelector"
      }, this.versionNode).startup();

      var versionsMap = data.map(lang.hitch(this, function(record){
        return dojo.create("option", {
          label: record,
          value: record
        });
      }));

      var versionSelect = dijit.byId("_versionSelector");
          versionSelect.addOption(versionsMap);
          this._version = versionSelect.value;

      this.own(on(versionSelect, 'change', lang.hitch(this, function(evt){
        this._version = evt;
      })));
    },

    initMultiSelect: function(data){
      new CheckedMultiSelect({
        name: 'Dynamic',
        id : '_typesMultiS',
        multiple: true 
      }, this.typeNode).startup()

      var map = data.map(function(record){
        return dojo.create("option", {
          label: record,
          value: record,
          selected: true
        })
      })

      var allOption = dojo.create("option", {
        label: "<b>All</b>",
        value: "All",
        selected: true
      }); 

      var typeMultiSelect = dijit.byId("_typesMultiS"); 
          typeMultiSelect.addOption(allOption)
          typeMultiSelect.addOption(map)

      this.own(on(typeMultiSelect, 'change', lang.hitch(this, function(evt){
        this.type = evt;
      })));

      //'All' checkbox
      this.own(on(dijit.byId('dijit_form_CheckBox_1'), 'change', lang.hitch(this, function(evt){
        if(evt == true){
          this.selectAllOptions(true, typeMultiSelect)
        }else{
          this.selectAllOptions(false, typeMultiSelect)
        }
      })));
    },

    selectAllOptions: function(mode, multiselect){
      for(i in multiselect.options){
        multiselect.options[i].selected = mode;
      }
    },

    initButtons: function(){
      new Button({
        label: this.nls.execute,
        id: 'Execute',
        onClick: lang.hitch(this, function(){
          this.performQuery();
        })
      }, this.executeFilterButtonNode).startup();

      new Button({
        label: this.nls.resetFilter,
        id: 'Reset',
        onClick: lang.hitch(this, function(){
          this.resetFilter();
        })
      }, this.executeResetFilterButtonNode).startup(); 
    },

    performQuery: function(){
      this.shelter.show();
      var def = new Deferred()
          def.resolve('Success!');
          def.then(lang.hitch(this, function(){
            this.activitiesLayer.hide();
            //Everytime the user clicks on the 'Execute' button the activities layer request = '1=1' (= Select * FROM...)
            this.activitiesLayer.setDefinitionExpression("1=1");
          })).then(lang.hitch(this, function(){
            var query = new Query();
                query.where = "" + this.config.getCountryFieldName + "  = '" + this.country + "'";
                query.returnGeometry = true;
                //Spatial analysis: intersect. Quering the activities layer using a country extent provided by world layer
                this.thatWorldLayer.queryFeatures(query).then(lang.hitch(this, function(featureSet){
                  if(featureSet.features.length > 0){
                    var extent = featureSet.features[0].geometry.getExtent()
                    this.map.setExtent(extent)

                    var query = new Query();
                        query.geometry = extent;
                        query.spatialRelationship = Query.SPATIAL_REL_ENVELOPEINTERSECTS;
                        query.returnGeometry = true;
                        query.outFields = ["*"];
                    this.activitiesLayer.queryFeatures(query, lang.hitch(this, function(efeatureSet){
                      if(efeatureSet.features.length > 0){
                        var oidsString = '';
                        for(i in efeatureSet.features){
                          oidsString += "'" + efeatureSet.features[i].attributes.OBJECTID + "',";
                        }

                        var getType = '';
                        var typeMultiSelectValue = dijit.byId("_typesMultiS").get("value");
                        
                        for(i in typeMultiSelectValue){
                          getType += "'" + typeMultiSelectValue[i] + "',";
                        } 
                        //We obtain the OIDs that corresponding to the intersect result; executing (below) the full query (country, activities and version)
                        var sql = 'OBJECTID' + ' in (' + oidsString.slice(0, -1) + ') AND ' + 
                                  this.config.getMultiSelectFieldName + ' in (' + getType.slice(0, -1) + ') AND ' +
                                  this.config.getVersionFieldName + ' = ' + "'" + this._version + "'";

                        this.activitiesLayer.setDefinitionExpression(sql); 
                        this.map.removeLayer(this.clusterLayer);  
                        this.addClusterLayer('filtered', sql) 
                      }else{
                        new Message({
                          message: 'There are no data with this query'
                        });
                        this.shelter.hide();
                      }                                     
                    }))
                  }
                }))
          })) 
    },   

    resetFilter: function(){
      this.shelter.show();
      this.map.removeLayer(this.clusterLayer); 
      this.addClusterLayer('All', '1=1') 
      this.setWorldExtent();
    }
  });
});
