/**
 * @author nttdocomo
 */
define(function(require) {
	var Picker = require("./picker"),
	DatePicker = require("../../picker/date");
	require("../../lang/date");
	require("moment");
	return taurus.view("taurus.form.field.Date", Picker.extend({
		format : 'MM/DD/YYYY',
		triggerTpl : '<div class="input-group-btn"><button class="btn form-trigger btn-default" type="button"><i class="halflings calendar"></i></button></div>',
		createPicker : function() {
			var picker = new DatePicker({
				endDate:this.endDate,
				pickerField : this,
				format:this.format,
				renderTo : $(document.body)
			});
			picker.on('itemclick', this.onItemClick, this);
			return picker;
		},
		alignPicker:function(){
			var me = this, picker = me.getPicker(),position,
			positionLeft = taurus.getPositionLeft(this.getAlignEl()),
			positionRight = taurus.getPositionRight(this.getAlignEl()),
			space = Math.max(positionLeft, positionRight);

			// Allow the picker to height itself naturally.
			/*if (picker.height) {
				delete picker.height;
				picker.updateLayout();
			}*/
			// Then ensure that vertically, the dropdown will fit into the space either above or below the inputEl.
			if((picker.getWidth() + positionLeft) > $(window).width()){
				position = {
					"my" : "right top",
					"at" : "right bottom"
				};
			} else {
				position = {
					"my" : "left top",
					"at" : "left bottom"
				};
			}
			me.doAlign(position);
		},
		getAlignEl:function(){
			return this.$el.find('.input-group');
		},
		initValue:function(){
			var value = this.value;
			if(!value){
				value = moment();
			} else {
				if (_.isString(value)) {
					value = moment(value, this.format);
				} else {
					value = moment(value);
				}
			}
			this.value = value;
			Picker.prototype.initValue.apply(this,arguments);
		},
		parseDate:function(value){
	        if(!value || _.isDate(value)){
	            return value;
	        }
	        var value = taurus.Date.parseDate(value, this.format);
			return value ? value : null;
		},
		getSubmitValue:function(){
			var value = this.getValue();
			return value ? value.utc().format(this.format) : '';
		},
		rawToValue : function(rawValue) {
			return moment(rawValue,this.format) || rawValue || null;
		},
		valueToRaw:function(value){
			//return taurus.Date.formatDate(taurus.Date.parseDate(value,this.format),this.format);
			return value.format(this.format);
		}
	}));
});
