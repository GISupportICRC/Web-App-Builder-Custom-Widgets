define(['jimu/BaseWidget',
        //Dojo
        'dojo/_base/declare', 
        'dojo/_base/lang',
        'dojo/query',
        'dojo/on',
        'dojo/dom',
        'dojo/dom-construct',
        'dojo/Deferred',
        //Dijit
        'dijit/form/Select',
        'dijit/form/Button',
        'dijit/form/CheckBox',
        //Esri
        'esri/layers/FeatureLayer',
        'esri/tasks/query', 
        'esri/tasks/QueryTask',
        'esri/request',
        //Jimu
        'jimu/dijit/LoadingShelter',
        'jimu/LayerInfos/LayerInfos',
        'jimu/dijit/Message',
        //Files
        'xstyle/css!./bootstrap/bootstrap-toggle.min.css',
        './bootstrap/bootstrap-toggle.min',
        './jquery/jquery-3.3.1.min'
        ],
function(BaseWidget, 
         declare, lang, query, on, dom, domConstruct, Deferred, 
         Select, Button, CheckBox, 
         FeatureLayer, Query, QueryTask, esriRequest,
         LoadingShelter, LayerInfos, Message,
         ICRCQueryTask
) {

  return declare([BaseWidget], {

    layer: null,
    project: null,
    region: null,
    country: null,
    start: null,
    end: null,
    sqlDefinition: [[], [], [], []],
    timeObject: null,

    
    startup: function() {
      this.inherited(arguments);
      this.initLoadingShelter(); 
      this.getWebMapLayer();
      this.quering();
      this.manageDateTime();
      this.enableToogleEvents();
    },

    initLoadingShelter: function(){
      this.shelter = new LoadingShelter({
        hidden: false
      });
      this.shelter.placeAt(this.loadingNode);
      this.shelter.startup();
      this.shelter.hide();
    },

    getWebMapLayer: function(){
      LayerInfos.getInstance(this.map, this.map.itemInfo)
        .then(lang.hitch(this, function(layerInfosObj) {
          var info = layerInfosObj._finalLayerInfos;
          for(i in info){
            if(info[i].layerObject.url == this.appConfig.projectLayerUrl){
              this.layer = layerInfosObj.getLayerInfoById(info[i].layerObject.id).layerObject
            }
          } 
        }))
    },

    quering: function(){
      var def = new Deferred()
          def.resolve(':D');
          def.then(lang.hitch(this, function(){
            var projectQuery = new Query()
                projectQuery.where = '1=1';
                projectQuery.outFields = [this.config.projectField];
                new QueryTask(this.appConfig.projectLayerUrl).execute(projectQuery, lang.hitch(this, function(results){
                  var map = results.features.map(lang.hitch(this, function(record){
                    return record.attributes[this.config.projectField]
                  }))
                  this.filteringData(map, this.config.projectField)
                }))
          })).then(lang.hitch(this, function(){
            var regionQuery = new Query()
                regionQuery.where = '1=1';
                regionQuery.outFields = [this.config.regionField];
                new QueryTask(this.appConfig.projectLayerUrl).execute(regionQuery, lang.hitch(this, function(results){
                  var map = results.features.map(lang.hitch(this, function(record){
                    return record.attributes[this.config.regionField]
                  }))
                  this.filteringData(map, this.config.regionField)
                }))
          })).then(lang.hitch(this, function(){
            var countriesQuery = new Query()
                countriesQuery.where = '1=1';
                countriesQuery.outFields = [this.config.countryField];
                new QueryTask(this.appConfig.projectLayerUrl).execute(countriesQuery, lang.hitch(this, function(results){
                  var map = results.features.map(lang.hitch(this, function(record){
                    return record.attributes[this.config.countryField]
                  }))
                  this.filteringData(map, this.config.countryField)
                }))
          })).then(lang.hitch(this, function(){
            var timeQuery = new Query()
                timeQuery.where = '1=1';
                timeQuery.outFields = ['objectid', this.config.startDateField, this.config.endDateField];
                new QueryTask(this.appConfig.projectLayerUrl).execute(timeQuery, lang.hitch(this, function(results){
                  this.timeObject = results.features.map(lang.hitch(this, function(record){
                    return {
                      objectid: record.attributes['objectid'],
                      startDate: new Date(record.attributes[this.config.startDateField]).getFullYear(),
                      endDate: new Date(record.attributes[this.config.endDateField]).getFullYear()
                    }
                  }))
                }))
          }))
    },

    getCountryName: function(change) {
      if(this.config.isoCountries.hasOwnProperty(change)){
        return this.config.isoCountries[change];
      }else{
        return change;
      }
    },

    filteringData: function(data, type){
      var def = new Deferred()
          def.resolve(data);
          def.then(lang.hitch(this, function(results){
            return data.sort()
                .filter(lang.hitch(this, function(x, i){
                  return data.indexOf(x) === i; 
                }))
                .map(lang.hitch(this, function(record){
                  if(type === this.config.countryField){
                    return domConstruct.create("option", {
                      label: this.getCountryName(record),
                      value: record
                    });
                  }else{
                    return domConstruct.create("option", {
                      label: record,
                      value: record
                    });
                  }
                }))
          })).then(lang.hitch(this, function(results){
            if(type === this.config.projectField){
              this.initProjectSelect(results)
            }else if(type === this.config.regionField){
              this.initRegionSelect(results)
            }else if(type === this.config.countryField){
              this.initCountrySelect(results)
            }
          }))
    },

    initProjectSelect: function(options){
      new Select({
        name: "themeProjectSelect",
        id: "themeProject"
      }, this.themeProjectNode).startup();

      var projectSelect = dijit.byId("themeProject");
          projectSelect.addOption(options);
          this.project = projectSelect.value;

      this.own(on(projectSelect, 'change', lang.hitch(this, function(evt){
        this.project = evt;
      })));
    },

    initRegionSelect: function(options){
      new Select({
        name: "regionsSelect",
        id: "regionsProject"
      }, this.regionNode).startup();

      var regionSelect = dijit.byId("regionsProject");
          regionSelect.addOption(options);
          this.region = regionSelect.value;

      this.own(on(regionSelect, 'change', lang.hitch(this, function(evt){
        this.region = evt;
      })));
    },

    initCountrySelect: function(options){
      new Select({
        name: "countrySelect",
        id: "countrySelect"
      }, this.countryNode).startup();

      var countrySelect = dijit.byId("countrySelect");
          countrySelect.addOption(options);
          this.country = countrySelect.value;

      this.own(on(countrySelect, 'change', lang.hitch(this, function(evt){
        this.country = evt;
      })));
    },


    manageDateTime: function(){
      var map = this.config.yearsArray.map(function(record){
        return domConstruct.create("option", {
          label: record,
          value: record
        });
      })
      
      new Select({
        name: "startSelect",
        id: "startSelect"
      }, this.startNode).startup();

      var startSelect = dijit.byId("startSelect");
          startSelect.addOption(map);
          this.start = startSelect.value;

      this.own(on(startSelect, 'change', lang.hitch(this, function(evt){
        this.start = evt;
      })));

      new Select({
        name: "endSelect",
        id: "endSelect"
      }, this.endNode).startup();

      var endSelect = dijit.byId("endSelect");
          endSelect.addOption(map);
          this.end = endSelect.value;

      this.own(on(endSelect, 'change', lang.hitch(this, function(evt){
        this.end = evt;
      })));
    },

    enableToogleEvents: function(){
      var self = this;

      $('#toggle-project').change(function(){
        self.shelter.show();
        if($(this).prop('checked')){
          self.performQuery('addProject')
        }else{
          self.performQuery('deleteProject')
        }
      }) 

      $('#toggle-region').change(function(){
        self.shelter.show();
        if($(this).prop('checked')){
          self.performQuery('addRegion')
        }else{
          self.performQuery('deleteRegion')
        }
      }) 

      $('#toggle-countries').change(function(){
        self.shelter.show(); 
        if($(this).prop('checked')){
          self.performQuery('addCountry')
        }else{
          self.performQuery('deleteCountry')
        }
      })

      $('#toggle-date').change(function(){
        self.shelter.show(); 
        if($(this).prop('checked')){
          var oids = self.timeObject.map(function(match){
            if(match.startDate == self.start && match.endDate == self.end){
              return match.objectid
            }
          }).filter(Boolean);

          if(oids.length == 0){
            new Message({
              message: 'There are no data with this query'
            });
            self.layer.setDefinitionExpression()
            self.shelter.hide(); 
          }else{
            self.performQuery('addYear', oids)
          }  
        }else{
          self.performQuery('deleteYear')
        }
      }) 
    },

    performQuery: function(arg, oids){
      var oidsString = '';
      for(i in oids){
        oidsString += "'" + oids[i] + "',"
      }

      if(arg == "addProject"){
        this.sqlDefinition[0].push(this.config.projectField + ' = ' + "'" + this.project + "'" + ' AND ');
      } else if(arg == "deleteProject"){
        this.sqlDefinition[0].length = 0;
      } else if(arg == "addRegion"){
        this.sqlDefinition[1].push(this.config.regionField + ' = ' + "'" + this.region + "'" + ' AND ');
      } else if(arg == "deleteRegion"){
        this.sqlDefinition[1].length = 0;
      } else if(arg == "addCountry"){
        this.sqlDefinition[2].push(this.config.countryField + ' = ' + "'" + this.country + "'" + ' AND ');
      } else if(arg == "deleteCountry"){
        this.sqlDefinition[2].length = 0;
      } else if(arg == "addYear"){
        this.sqlDefinition[3].push('objectid in(' + oidsString.slice(0, -1) + ') AND ');
      } else if(arg == "deleteYear"){
        this.sqlDefinition[3].length = 0;
      } 

      this.replaceQueryString((this.sqlDefinition[0] + this.sqlDefinition[1] + this.sqlDefinition[2] + this.sqlDefinition[3]).slice(0, -5));
    },

    confirmQuery: function(string){
      var query = "&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson";

      var layersRequest = esriRequest({
        url: this.appConfig.projectLayerUrl + "/query?where=" + string + 
             query.slice(0, -7),
        content: { f: "json" },
        handleAs: "json",
        callbackParamName: "callback"
      })
      layersRequest.then(
        lang.hitch(this, function(results){
          if(results.features != 0){
            this.layer.setDefinitionExpression((this.sqlDefinition[0] + this.sqlDefinition[1] + this.sqlDefinition[2] + this.sqlDefinition[3]).slice(0, -5));
          }else{
            new Message({
              message: 'There are no data with this query'
            });
            this.layer.setDefinitionExpression()
          }
        })).always(lang.hitch(this, function(){
          this.shelter.hide();
        }))
    },

    replaceQueryString: function(string){
      this.confirmQuery(string.replace(/=/g, "%3D").replace(/'/g, "%27").replace(/\s/g, "+"))
    },

    resetFilter: function(){
      this.layer.setDefinitionExpression()
    }
  });
});