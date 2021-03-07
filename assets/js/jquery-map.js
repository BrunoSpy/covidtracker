// require jquery and jquery-ui.widget-factory

/**
 * JQuery Plugin to add a data map of France
 * Requires Jquery UI Widget Factory
 * Usage : $('element').datamap({
 *      values: array of values - default : [">", "250", "150", "50"]
 *      colors: array of colors corresponding to values - default : ["#3c0000", "#c80000", "#f95228", "#98ac3b"]
 *      legendDirection : "ascending" or "descending" - default : "descending"
 *      symbol: trailing symbol for legend
 *      svgPath: path to the svg map
 *      data: data to be mapped - json format
 *  });
 * Licence : AGPL
 * @author Bruno Spyckerelle
 * @version 1.0
 */

( function() {
    $.widget('covidtracker.datamap', {

        /**
         *
         * @memberOf $
         */
        version: "0.0.1",

        legendContainer: null,

        options: {
            svgPath: "",
            values: [">", "250", "150", "50"],
            colors: ["#3c0000", "#c80000", "#f95228", "#98ac3b"],
            legendDirection: "descending",
            svgId: "data-num",
            iterationKey: "num_dep",
            valueKey: "incidence_cas",
            symbol: '',
            hoverCallback: function(){},
            clickCallback: function(){}
        },

        _create: function(){
            let self = this;
            if( this.options.values.length != this.options.colors.length) {
                throw 'Values and colors arrays have not the same size.';
            }
            self.element.load(self.options.svgPath, function(e){
                let svg = self.element.find('svg');
                svg[0].removeAttribute('width');
                svg[0].removeAttribute('height');
                svg.css({'padding-right': '50px'})
                self._colorize();
                self._buildLegend();
            });

            //survol de la légende -> surbrillance des départements/régions
            $(self.element).on({
                mouseenter: function(e){
                    let idx = $(this).data('valueidx');
                    let borneinf, bornesup;
                    if(self.options.legendDirection == "ascending") {
                            borneinf = self.options.values[idx];
                        if(idx == self.options.values.length-1) {
                            bornesup = Infinity;
                        } else {
                            bornesup = self.options.values[idx+1];
                        }
                    } else {
                        if(self.options.values[idx] == ">") {
                            borneinf = self.options.values[idx+1];
                            bornesup = Infinity;
                        } else if(self.options.values.length-1 == idx) {
                            borneinf = 0;
                            bornesup = self.options.values[idx];
                        } else {
                            borneinf = self.options.values[idx+1];
                            bornesup = self.options.values[idx];
                        }
                    }
                    $('svg path').filter(function(){
                        let val = $(this).data(self.options.valueKey);
                        return val >= borneinf && val <= bornesup;
                    }).css({"stroke-width": '2.6', "stroke": "yellow"});
                },
                mouseleave: function(){
                    $('svg path').css({'stroke-width': '0.6', 'stroke': 'white'});
                }
            },'.legendElt')

        },

        _setOption: function(key, value) {
            this._super(key, value);
            let self = this;
            if(key == "svgPath") {
                this.element.load(value, function(e){
                    self.refresh();
                });
            } else {
                if( this.options.values.length != this.options.colors.length) {
                    throw 'Values and colors arrays have not the same size.';
                } else {
                    self.refresh();
                }
            }
        },

        /* *********************** */
        /* *** Public Methods *** */
        /* *** ******************* */

        /**
         * Redraw map
         */
        refresh: function(){
            this._colorize();
            this._buildLegend();
        },

        /* *********************** */
        /* *** Private Methods *** */
        /* *** ******************* */
        _buildLegend: function(){
            let self = this;
            if(this.legendContainer == null) {
                let randId = Math.floor(Math.random() * Math.floor(1000));
                this.legendContainer = $('<div id="legend'+randId+'" class="mapLegend" style="position: absolute; right: 1rem;"></div>');
                this.element.prepend(this.legendContainer);
            }
            this.legendContainer.empty().append('<table><tbody></tbody></table>');
            let tbody = this.legendContainer.find('tbody');
            this.options.values.map((val, idx) => {
                let value = self.options.values[idx];
                if(value > 0) {
                    value = '+ '+value;
                }
                if (value != '>') {
                    value = value + ' ' + self.options.symbol;
                }
                tbody.append('<tr><td class="legendElt" style="text-align: center; background-color: '+self.options.colors[idx]+'; color: white; font-size: 50%; padding: 5px;" data-valueidx="'+idx+'">'+self.options.values[idx]+'</td></tr>')
            });
            this.legendContainer.css('margin-bottom', '-'+this.legendContainer.offsetHeight+'px');
        },
        _getColor: function(value){
            if (this.options.legendDirection == "ascending") {
                for (let i = this.options.colors.length -1; i >= 0; i--){
                    if (i == 0) {
                        return this.options.colors[i];
                    } else if ( value >= this.options.values[i]) {
                        return this.options.colors[i];
                    }
                }
            } else { //"descending" by default
                for (let i = this.options.colors.length -1; i >=0 ; i--) {
                    if( i == 0) { //borne supérieure
                        return this.options.colors[i];
                    } else if ( value <= this.options.values[i]) {
                        return this.options.colors[i];
                    }
                }
            }
        },
        _colorize: function(){
            let self = this;
            //console.log('colorize');
            //console.log(self.options.data);
            $.each(self.options.data, function(key, value){
                //console.log(value);
                let selector = 'path['+self.options.svgId+'="'+value[self.options.iterationKey]+'"]';
                let elt = self.element.find(selector);
                //console.log(elt);
                //console.log(self._getColor(value[self.options.valueKey]));
                elt.css("fill", self._getColor(value[self.options.valueKey]));
                //console.log('value '+value[self.options.valueKey]);
                elt.data(self.options.valueKey, value[self.options.valueKey])
            });
        }
    });
})(jQuery);