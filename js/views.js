// View - Pick Vehicle
(function(){

	// sub-view Vehicle Year
	App.Views.VehicleOption = Backbone.View.extend({
		initialize : function( opts ) {
			this.type = opts.type;
			this.title = opts.title;
			this.mod = opts.mod;
		},
		template : template('vehicleOptionTemplate'),
		render : function(){
			var $mod = this.mod,
				$type = this.type,
				cellArray = [],
				year = 2016,
				previous = {
					'year' : null,
					'make' : 'year',
					'model' : 'make',
					'trim' : 'model'
			};
			
			this.$el.html(this.template({
				'previous' : previous[$type],
				'type' : $type,
				'title' : this.title,
				'mod' : $mod
			  })
			);
			
			if ( this.type == 'year' ){ for ( var i = 1 ; i < 35 ; i++ ){ cellArray.push( year - i );	} }
			else if ( this.type == 'make' ){ cellArray = window.App.Settings.Makes; }
			else if ( this.type == 'model' ){ cellArray = window.App.Settings.Models; }

			var row = document.createElement('tr');
				$tbody = this.$('tbody');

			_.each( cellArray, function( option, i ){
				var cell = document.createElement('td'),
					btn = document.createElement('button');

					btn.value = option;
					btn.innerHTML = option;
					btn.setAttribute("data-set",$type);

					cell.appendChild( btn );
					row.appendChild( cell );
					
					if ( i%$mod == ( $mod-1 ) ){
						$tbody.append(row);
						row = document.createElement('tr');	
					}
			});
			this.$el.hide();
			return this;
		}
	});

	App.Views.VehicleQuestions = Backbone.View.extend({
		template : template('vehicleOptionForm'),
		updateHowFar : function(){
			if ( this.model.get("doesWorkSchool") == 'Pleasure' ){ this.$('#howFarField').hide(); }
			else{ this.$('#howFarField').show(); }			
		},		
		initialize : function(){
			this.model.on("change:doesWorkSchool", this.updateHowFar, this );	
		},
		render : function(){
			var content = $('<div>').append( this.template(this.model.toJSON()) ).addClass('row');
			this.$el.hide().html( content ).append( template('vehicleButtonsTemplate')() );
			this.updateHowFar();
			return this;
		}
	});
	
	App.Views.VehicleTitle = Backbone.View.extend({
		template : template('vehicleTitleTemplate'),
		initialize : function(){
			this.model.on("change", this.render, this );
		},
		className : 'row',
		render : function(){
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		}
	});
	
	App.Views.PickVehicle = Backbone.View.extend({
		events : {
			"click [data-set]" : "setProperty",
			"click [data-unset]" : "unsetProperty",
			"change input": "fieldChanged",
			"change select": "selectionChanged",
			
			"click #deleteAuto" : "deleteAuto",
			"click #editAuto" : "editAuto",
			"click #saveAuto" : "saveAuto",
		},
		setProperty : function(e){
			var _this = this,
				$e = $(e.currentTarget);
			
			this.auto.set( $e.attr('data-set'), $e.val() );
			this.panels[this.panelPosition].$el.fadeOut(100, function(){
				_this.panelPosition++;
				_this.panels[_this.panelPosition].$el.fadeIn();
			});
		},
		unsetProperty : function(e){
			var _this = this,
				$e = $(e.currentTarget);			

			this.auto.set( $e.attr('data-unset'), "" );
			this.panels[this.panelPosition].$el.fadeOut(100, function(){
				_this.panelPosition--;
				 _this.panels[_this.panelPosition].$el.fadeIn();
			});			
		},
		selectionChanged: function(e){
			var field = $(e.currentTarget);
			var value = $("option:selected", field).val();
			var data = {};
			data[field.attr('id')] = value;
			this.auto.set(data);
		},
		fieldChanged: function(e){
			var field = $(e.currentTarget);
			var data = {};
			data[field.attr('id')] = field.val();

			// keeping True and False Boolean 
			data[field.attr('id')] = ( data[field.attr('id')] == 'true' ) ? true : data[field.attr('id')];
			data[field.attr('id')] = ( data[field.attr('id')] == 'false' ) ? false : data[field.attr('id')];			
			data[field.attr('id')] = ( typeof data[field.attr('id')] == 'string' ) ? _.str.trim(data[field.attr('id')]) : data[field.attr('id')];

			this.auto.set(data);
		},

		editAuto : function(){
			this.auto.resetAuto()
			this.panelPosition = 0;
			this.render();
		},
		deleteAuto : function(){
			this.model.get("Vehicles").remove(this.auto);
			vent.trigger("save:auto");
		},
		saveAuto : function(){
			var $this = this;
			if ( window.$form.valid() ){
				this.model.get("Vehicles").add(this.auto);
				this.$el.fadeOut(200, function(){
					$this.remove();	
					vent.trigger("save:auto");				
				});
			}
		},
		initialize : function(opts){
			this.editing = ( opts.editing ) ? opts.editing : false;
	
			// models 
			if ( this.editing ){
				this.auto = this.model.get("Vehicles").get( opts.auto );
				this.panelPosition = 3;
			}else{
				this.auto = new App.Models.Vehicle;
				this.panelPosition = 0;
			}
			

			// views 
			this.panels = {
			0 : new App.Views.VehicleOption({
				model : this.auto,
				className : 'tableYear',
				type : 'year',
				title : 'Vehicle Year',
				mod : 5,
			}),
			1 : new App.Views.VehicleOption({
				model : this.auto,
				className : 'tableMake',
				type : 'make',
				title : 'Vehicle Make',
				mod : 7	
			}),
			2 : new App.Views.VehicleOption({
				model : this.auto,
				className : 'tableModel',
				type : 'model', 
				title : 'Vehicle Model',
				mod : 4
			}),
			3 :  new App.Views.VehicleQuestions({
				model : this.auto
				})
			};
			this.title = new App.Views.VehicleTitle({
				model : this.auto,
			});
			
		},
		render : function(){
			this.$el.empty();
			this.$el.hide();

			this.$el.append( this.title.render().el  );
			this.$el.append( this.panels[0].render().el );
			this.$el.append( this.panels[1].render().el );
			this.$el.append( this.panels[2].render().el );	
			this.$el.append('<hr />');
			this.$el.append( this.panels[3].render().el );
		
			
			var deleteBtn = this.$('#deleteAuto');
			
			if ( this.model.get("Vehicles").length > 1 && this.auto.id > 1 ){ deleteBtn.show(); }
			else{ deleteBtn.hide(); }
			
			this.panels[this.panelPosition].$el.show();
			this.$el.fadeIn( 500 );
			return this;	
		}
	});
	
	
	App.Views.ShowVehicles = Backbone.View.extend({
		template : template('vehicleItemTemplate'),		
		events : {
			"click [data-add]" : "addItem",
			"click [data-edit]" : "editItem",
			"mouseover li" : "showEditButton",
			"mouseout li"  : "hideEditButton",
		},
		showEditButton : function(e){ $(e.currentTarget).find('button').show(); },
		hideEditButton : function(e){ $(e.currentTarget).find('button').hide(); },
		addItem : function(e){
			return vent.trigger("add:auto");
		},
		editItem : function(e){
			return vent.trigger("edit:auto",e.currentTarget.getAttribute("data-edit"));
		},
		render : function(){
			this.$el.empty();
			
			var $holder = $('<div />').addClass('row vehicleList');
			var $ul = $('<ul />');
			
			this.collection.each( function( car, index ){
				$ul.append(this.template( car.toJSON() ));
			}, this);
			$holder.append($ul);
			
			this.$el.append("<h1>Your Vehicles</h1>");
			this.$el.append( $holder ).append( template('vehicleListButtonsTemplate')() );
			return this;
		}
	});
	
	App.Views.ShowDrivers = Backbone.View.extend({
		events : {
			"click [data-add]" : "addItem",
			"click [data-edit]" : "editItem",
			"mouseover li" : "showEditButton",
			"mouseout li"  : "hideEditButton",
		},
		addItem : function(e){
			return vent.trigger("add:driver",e.currentTarget.getAttribute("data-add"));
		},
		editItem : function(e){
			return vent.trigger("edit:driver",e.currentTarget.getAttribute("data-edit"));
		},
		showEditButton : function(e){ $(e.currentTarget).find('button').show(); },
		hideEditButton : function(e){ $(e.currentTarget).find('button').hide(); },
		template : template('driverItemTemplate'),		
		render : function(){
			this.$el.empty();
			
			var $holder = $('<div />').addClass('row driverList');
			var $ul = $('<ul />');
			
			this.collection.each( function( driver, index ){
				$ul.append(this.template( driver.toJSON() ));
			}, this);
			$holder.append($ul);
			this.$el.append('<h1>Drivers to Insure</h1>').append( $holder ).append('<hr />').append( new App.Views.AddDriverButtons({ collection : this.collection }).render().el );
			return this;
		}
	});			


	App.Views.AddDriverButtons = Backbone.View.extend({
		className : 'row',
		template : template('driverAddButtons'),
		render : function(){
			this.$el.html( this.template() );
			if ( this.collection.where({ RelationshipToApplicant : 'Spouse' }).length > 0 ){ this.$('[data-add="Spouse"]').hide(); }
			return this;
		}
	});
	
	
	App.Views.AddDriver = Backbone.View.extend({
		events : {
			"change input": "fieldChanged",
			"change select": "selectionChanged",
			"click #saveDriver" : "saveDriver",	
			"click #cancelDriver" : "cancelDriver",
			"click #deleteDriver" : "deleteDriver",
		},
		template : template('driverTemplate'),
		initialize : function(opts){
			this.editing = ( opts.editing ) ? opts.editing : false;
			if ( this.editing ){
				this.Driver = this.model.get("Drivers").get( opts.driver ).clone();
			}else{
				this.Driver = new App.Models.Driver({
					RelationshipToApplicant : opts.RelationshipToApplicant 
				});
			}
			this.Driver.on("change:age", this.updatefirstLicense, this);
		},
		updatefirstLicense : function(){
			var $fl = this.$('#firstLicense').empty();
			for ( var i = 16 ; i <= this.Driver.get("age"); i++ ){ 
				var option = '<option value="'+i+'"';
					if ( this.Driver.get("firstLicense") == i ){ option += 'selected'; }
					option += '>'+i+'</option>';
				$fl.append(option);
			 }
		},
		selectionChanged: function(e){
			var field = $(e.currentTarget);
			var value = $("option:selected", field).val();
			var data = {};
			data[field.attr('id')] = value;
			this.Driver.set(data);
//			console.log( this.Driver.toJSON() );
		},
		fieldChanged: function(e){
			var field = $(e.currentTarget);
			var data = {};
			data[field.attr('id')] = field.val();
			
			// keeping True and False Boolean 
			data[field.attr('id')] = ( data[field.attr('id')] == 'true' ) ? true : data[field.attr('id')];
			data[field.attr('id')] = ( data[field.attr('id')] == 'false' ) ? false : data[field.attr('id')];			
			data[field.attr('id')] = ( typeof data[field.attr('id')] == 'string' ) ? _.str.trim(data[field.attr('id')]) : data[field.attr('id')];
			this.Driver.set(data);
		},	
		cancelDriver : function(){
			this.remove();
			vent.trigger("save:driver");
		},
		deleteDriver : function(){
			this.model.get("Drivers").remove(this.Driver);
			vent.trigger("save:driver");
		},		
		saveDriver : function(){
			var $this = this;
			// step 1 validation shit here .... 
			// step 2 set model details 

			if ( window.$form.valid() ) {
				if ( this.editing == true ){
					//console.log("EDITING A DRIVER");
					this.model.get("Drivers").add(this.Driver,{merge:true});
				}else{
					//console.log("ADDING", this.Driver.toJSON() );
					this.model.get("Drivers").add(this.Driver);	
				}

				$this.remove();
				vent.trigger("save:driver");
			}
		},		
		render : function(){
			// render template
			this.$el.html( this.template({
					driver : this.Driver.toJSON(),
					vehicles : this.model.get("Vehicles").toJSON()
				}
			));
			
			// trigger some stuff 
			this.updatefirstLicense();

			if ( this.editing && this.model.get("Drivers").length > 1 ){
				if ( this.Driver.id !== 1 ){ this.$('#deleteDriver').show(); }
				this.$('#cancelDriver').show();
			}else if ( this.model.get("Drivers").length >= 1 ){
				this.$('#cancelDriver').show();
			}else if (  this.editing  ){
				this.$('#cancelDriver').show();				
			}
			return this;	
		}	
		
	});
	
	App.Views.BaseView = Backbone.View.extend({
		events : {
			"change input": "fieldChanged",
			"change select": "selectionChanged",
		},
		selectionChanged: function(e){
			var field = $(e.currentTarget);
			var value = $("option:selected", field).val();
			var data = {};
			data[field.attr('id')] = value;
			this.model.set(data);
		},
		fieldChanged: function(e){
			var field = $(e.currentTarget);
			var data = {};
			data[field.attr('id')] = field.val();
			
			// keeping True and False Boolean 
			data[field.attr('id')] = ( data[field.attr('id')] == 'true' ) ? true : data[field.attr('id')];
			data[field.attr('id')] = ( data[field.attr('id')] == 'false' ) ? false : data[field.attr('id')];			
			data[field.attr('id')] = ( typeof data[field.attr('id')] == 'string' ) ? _.str.trim(data[field.attr('id')]) : data[field.attr('id')];
			this.model.set(data);
		},	
	});

	App.Views.CoverageTable = Backbone.View.extend({
		events : {
			"click [data-coverage]" : "setCoverage"
		},
		initialize : function(){
			this.model.on("change:Liability", this.render, this );
		},
		setCoverage : function(e){
			this.model.set("Liability",e.currentTarget.getAttribute('data-coverage'))
		},
		render : function(){
			var rows = [
				{ 	key : "body",
					name : "Bodily Injury",
					tooltip :"Bodily Injury Liability pays damages for people injured or killed in an accident for which you are legally responsible. The first number in the coverage limit is for any one person; the second is the total coverage limit for one incident or accident."	
				},
				{ 	key : "property",
					name : "Property Damage",
					tooltip : "Property Damage Liability pays for damage to other people's property resulting from an accident caused by your auto for which you are legally responsible. $50,000 of coverage is the recommended amount by the Insurance Information Institute."
				},
				{	key : "medical",
					name : "Medical",
					tooltip : "Medical payments coverage pays the reasonable and necessary medical, dental, hospital and funeral expenses for the insured, covered passengers and family members, who are injured in a covered auto accident, regardless of who was at fault. Coverage is also provided to the insured and resident relatives, while they are riding in someone else's car at the time of the accident or if they are struck as a pedestrian."	
				},
				{ 
					key : "roadside",
					name : "Roadside & Rental",
					tooltip : "Roadside pays for towing, jump-starting your car, and other emergencies. If you have AAA or some other auto club membership, you may not need this. Rental coverage pays for a rental vehicle if your car isn't drivable for more than 24 hours because of a covered accident."
				},
				{	
					key : "checkboxes",
					name : ""
				}
				];
			var $model = this.model;
			var table = $('<table />').addClass('table table-bordered table-compare');
			var thead = $('<thead />').append('<tr />');
			var tbody = $('<tbody />');

			// append some stuff 
			table.append(thead);
			thead.find('tr').append('<th />');

			// make theading columns columns 			
			_.each( window.App.Settings.Coverage, function( cov ){
				var td = $('<th />').html(_.str.capitalize(cov.name)).attr('data-coverage',cov.name).addClass('clickable');
				if ( $model.get("Liability") === cov.name ){ td.addClass('active'); }
					thead.find('tr').append( td );
			});

			// make rows 
			_.each( rows, function( row, i ){
				var trow = $('<tr />');
				var tooltip = $('<div />').addClass('fieldtip').attr('data-toggle','tooltip').attr('data-title',row.tooltip).attr('data-trigger','hover');
				var td = $('<td />').html('<strong>'+row.name+'</strong>');

				// add checkboxes			
				if ( row.key !== 'checkboxes' ){ td.prepend(tooltip); }
				// add the first column
				trow.append(td);
				// add the rest of the columns
				_.each( window.App.Settings.Coverage, function( cov ){
					if ( row.key == 'checkboxes' ){ 
						trow.append('<td><input type="radio" name="desiredCoverage" data-coverage="'+cov.name+'" /></td>'); 
					}else{ trow.append('<td class="clickable" data-coverage="'+ cov.name +'">'+cov.info[row.key]+'</td>'); }
					
					if ( $model.get("Liability") === cov.name ){ 
						trow.find('[data-coverage="'+cov.name+'"]').prop("checked",true).addClass('active');
					}
				});
				tbody.append(trow);
			});
				
			table.append(thead).append(tbody);
			this.$el.html(table);
			return this;	
		},		
	});
	
	
	
	
	
	
	
	
	
	
	
	App.Views.CoverageController = Backbone.View.extend({
		events : {
			"click #saveCoverage" : "saveCoverage",
			"change input": "fieldChanged",
			"change select": "selectionChanged",	
//			"change #currentlyInsured" : "hideShowInsurance",
		},
		initialize : function(){
			this.Coverage = this.model.get("Coverage");
			this.Coverage.on("change:currentlyInsured", this.hideShowInsurance, this );
		},
		saveCoverage : function(e){
			e.preventDefault();
			if ( window.$form.valid() ) {
				this.model.set("hasCoverage",true);
				this.remove();
				window.Route.navigate("incidents",{trigger:true});
			}
			return;	
		},
		selectionChanged: function(e){
			var field = $(e.currentTarget);
			var value = $("option:selected", field).val();
			var data = {};
			data[field.attr('id')] = value;
			this.Coverage.set(data);
			return this;
//			console.log( this.model.toJSON() );
		},
		fieldChanged: function(e){
			var field = $(e.currentTarget);
			var data = {};
			data[field.attr('id')] = field.val();
			
			// keeping True and False Boolean 
			data[field.attr('id')] = ( data[field.attr('id')] == 'true' ) ? true : data[field.attr('id')];
			data[field.attr('id')] = ( data[field.attr('id')] == 'false' ) ? false : data[field.attr('id')];			
			data[field.attr('id')] = ( typeof data[field.attr('id')] == 'string' ) ? _.str.trim(data[field.attr('id')]) : data[field.attr('id')];


			if (  field.attr('id') == 'currentlyInsured'  ){
				var value = ( field.prop('checked') ) ? "1" : "0"
				this.Coverage.set("currentlyInsured",value);
			}else{ this.Coverage.set(data); }
			return this;
//			console.log( this.model.toJSON() );
		},			
		hideShowInsurance : function(){
			if ( this.Coverage.get("currentlyInsured") == "1" ){  this.coverageOptions.fadeIn(500);	}
			else{ this.coverageOptions.hide(); }
		},
		template : template('coverageTemplate'),
		render : function(){
			this.$el.html(this.template( this.Coverage.toJSON() ));

			this.$('#chooseCoverage').html( new App.Views.CoverageTable({ model : this.Coverage }).render().el );
			this.coverageOptions = this.$('#coverageOptions');
			this.$('#insuranceCompany').typeahead({ source : window.App.Settings.CoverageCompanies });
			this.hideShowInsurance();
			
			this.delegateEvents();
			return this;	
			
		}
	});
	
	
	
	
	
	
	
	
	
	
	
	App.Views.AutoController = Backbone.View.extend({
		initialize : function(){
			vent.on("save:auto", this.listAutos, this );
			vent.on("add:auto", this.addAuto, this );
			vent.on("edit:auto", this.editAuto, this );
			//console.log("initialize AutoController");
		},
		addAuto : function(){
			this.$el.html( new App.Views.PickVehicle({ model : this.model }).render().el );	
			return this;
		},
		editAuto : function(id){
			this.$el.html( new App.Views.PickVehicle({ 
				model : this.model,
				editing : true,
				auto : id
			}).render().el );
			return this;		
		},
		listAutos : function(){
			this.$el.html( new App.Views.ShowVehicles({ collection : this.model.get("Vehicles") }).render().el );
			return this;
		},
		render : function(){

			this.$el.empty();
			if ( this.model.get("Vehicles").length == 0 ){
				return this.addAuto();
			}else{
				return this.listAutos();
			}
		}
	});
	
	
	App.Views.DriverController = Backbone.View.extend({
		initialize : function(){
			vent.on("save:driver", this.listDrivers, this );
			vent.on("add:driver", this.addDriver, this );
			vent.on("edit:driver", this.editDriver, this );
			//console.log("initialize DriverController");			
		},
		editDriver : function(id){
			return this.$el.empty().html( new App.Views.AddDriver({ 
				model : this.model,
				editing : true,
				driver : id
			}).render().el );
		},
		addDriver : function(e){
			var relationship = ( this.model.get("Drivers").length == 0 ) ? 'Self' : e;
			this.$el.empty().html( new App.Views.AddDriver({ 
				model : this.model,
				RelationshipToApplicant : relationship
			}).render().el );
			return this;
		},
		listDrivers : function(){
			this.$el.empty().html( new App.Views.ShowDrivers({ collection : this.model.get("Drivers") }).render().el );
			return this;
		},
		render : function(){
			this.$el.empty();
			if ( this.model.get("Drivers").length == 0 ){ this.addDriver(); }
			else{  this.listDrivers(); }
			return this;
		}	
	});
	
	
	// ****************************** //
	//  INCIDENT VIEWS
	// ****************************** //
	App.Views.IncidentDUI = Backbone.View.extend({
		template : template('incidentDUITemplate'),
		render : function(){
			this.$el.html( this.template(this.model.toJSON()) );
			return this;	
		}	
	});	
	App.Views.IncidentTicket = Backbone.View.extend({
		template : template('incidentTicketTemplate'),
		render : function(){
			this.$el.html( this.template(this.model.toJSON()) );
			return this;	
		}	
	});
	App.Views.IncidentClaim = Backbone.View.extend({
		template : template('incidentClaimTemplate'),
		render : function(){
			this.$el.html( this.template(this.model.toJSON()) );
			return this;	
		}	
	});	
	App.Views.IncidentAccident = Backbone.View.extend({
		template : template('incidentAccidentTemplate'),
		render : function(){
			this.$el.html( this.template(this.model.toJSON()) );
			return this;	
		}	
	});	
	
	
	App.Views.ReportIncidentView = Backbone.View.extend({
		events : {
			"change #incidentType" : "setIncidentInfo",
			"click #saveIncident" : "saveIncident",
			"click #cancelIncident" : "cancelIncident",
			"click #deleteIncident" : "deleteIncident",
			"change input": "fieldChanged",
			"change select": "selectionChanged",			
		},
		initialize : function(opts){
			this.editing = ( opts.editing ) ? opts.editing : false;

			if ( this.editing ){
				this.Incident = this.model.get("Incidents").get( opts.id ).clone();
			}else{
				this.Incident = new App.Models.Incident();
			}

		},
		selectionChanged: function(e){
			var field = $(e.currentTarget);
			var value = $("option:selected", field).val();
			var data = {};
			data[field.attr('id')] = value;
			this.Incident.set(data);
//			console.log( this.Incident.toJSON() );
		},
		fieldChanged: function(e){
			var field = $(e.currentTarget);
			var data = {};
			data[field.attr('id')] = field.val();
			
			if ( field.attr('id') == 'AtFault' ){
				data[field.attr('id')] = parseInt( data[field.attr('id')] );
			}
			
			// keeping True and False Boolean 
			data[field.attr('id')] = ( data[field.attr('id')] == 'true' ) ? true : data[field.attr('id')];
			data[field.attr('id')] = ( data[field.attr('id')] == 'false' ) ? false : data[field.attr('id')];			
			data[field.attr('id')] = ( typeof data[field.attr('id')] == 'string' ) ? _.str.trim(data[field.attr('id')]) : data[field.attr('id')];
			this.Incident.set(data);
//			console.log( this.Incident.toJSON() );
		},
		deleteIncident : function(){
			this.model.get("Incidents").remove(this.Incident);
			vent.trigger("save:incident");
			this.remove();
		},			
		cancelIncident : function(){
			vent.trigger("save:incident");
			this.remove();
		},	
		saveIncident : function(){
			var type = this.Incident.get("incidentType");
			if ( window.$form.valid() ) {
				this.Incident.set("description", this.$("#description").val());	

				if ( type !== 'ticket' ){
					if ( !this.Incident.get("WhatDamaged") ){ this.Incident.set("WhatDamaged", this.$("#WhatDamaged").val()); }
 					if ( !this.Incident.get("InsurancePaidAmount") ){ this.Incident.set("InsurancePaidAmount", this.$("#InsurancePaidAmount").val()); }
				}

				if ( this.editing == true ){ this.model.get("Incidents").add(this.Incident,{merge:true});
				}else{ this.model.get("Incidents").add(this.Incident); }
				
				vent.trigger("save:incident");	
				this.remove();

			}
		},
		setIncidentInfo : function(e){
			var infoDiv = this.$('#incidentReport').hide().removeClass('row'),
				type = ( e && e.currentTarget.value ) ? e.currentTarget.value : this.Incident.get("incidentType");
				
			if ( e && e.currentTarget.value ){  this.Incident.set("incidentType",e.currentTarget.value); }
			if ( type == 'dui'){
				infoDiv.addClass('row');
				infoDiv.html( new App.Views.IncidentDUI({ model : this.Incident }).render().el ).fadeIn(500);
			}else if ( type == 'ticket' ){
				infoDiv.addClass('row');
				infoDiv.html( new App.Views.IncidentTicket({ model : this.Incident }).render().el ).fadeIn(500);
			}else if ( type == 'claim' ){
				infoDiv.html( new App.Views.IncidentClaim({ model : this.Incident }).render().el ).fadeIn(500);
			}else if ( type == 'accident' ){
				infoDiv.html( new App.Views.IncidentAccident({ model : this.Incident }).render().el ).fadeIn(500);
			}
			return this;
			
		},
		template : template('incidentReportTemplate'),
		render : function(){
			this.$el.html( this.template({
				incident : this.Incident.toJSON(),
				drivers : this.model.get("Drivers").toJSON()		
			}) );
			
			this.setIncidentInfo();
			if ( this.editing == false ){ this.$('#deleteIncident').hide(); }
			return this;	
		}
	});


	App.Views.ShowIncidents = Backbone.View.extend({
		events : {
			"click [data-add]" : "addItem",
			"click [data-edit]" : "editItem",
			"mouseover li" : "showEditButton",
			"mouseout li"  : "hideEditButton",
		},
		showEditButton : function(e){ $(e.currentTarget).find('button').show(); },
		hideEditButton : function(e){ $(e.currentTarget).find('button').hide(); },		
		addItem : function(e){
			e.preventDefault();
			e.stopPropagation();
			return vent.trigger("add:incident",e.currentTarget.getAttribute("data-add"));
		},
		editItem : function(e){
			return vent.trigger("edit:incident",e.currentTarget.getAttribute("data-edit"));
		},
		template : template('incidentItemTemplate'),		
		render : function(){
			this.$el.empty();
			
			var $model = this.model,
				$holder = $('<div />').addClass('row incidentList'),
				$ul = $('<ul />');
				
			$model.get("Incidents").each( function( incident, index ){
				var data = incident.toJSON();
					data.driverName = $model.get("Drivers").get( data.incidentDriver ).get("driverName");
				$ul.append(this.template( data ));
			}, this);
			
			$holder.html( $ul );
			this.$el.html('<h1>Your Traffic Incidents</h1>').append( $holder );
			return this;
		}
	});		
	
		
	App.Views.IncidentsController = Backbone.View.extend({
		events : {
			'click [data-add="incident"]' : 'addIncident',
			'click #finishIncidents' : 'finishIncidents',
		},
		initialize : function(){
			vent.on("edit:incident", this.editIncident, this );
			vent.on("save:incident", this.showIncidents, this );	
		},
		finishIncidents : function(e){
			this.model.set("hasIncidents",true);
		},
		showIncidents : function(){
			if ( this.model.get("Incidents").length > 0 ){
				this.$el.empty().html( new App.Views.ShowIncidents({ model : this.model }).render().el ).append( template('incidentListButtonsTemplate')() );;
			}else{ this.render(); }
		},
		addIncident : function(){
			this.$el.empty().html( new App.Views.ReportIncidentView({ model : this.model }).render().el );
			return this;
		},
	 	editIncident : function(id){
			this.$el.empty().html( new App.Views.ReportIncidentView({ 	
				model : this.model,
				editing : true,
				id : id
			}).render().el );
			return this;			
		},
		template : template('incidentTemplate'),
		render : function(){
			if ( this.model.get("Incidents").length > 0 ){ this.showIncidents(); }
			else{ this.$el.empty().html( this.template() );	}
			
			this.delegateEvents();
			return this;	
		}
	});
	
	
	
	App.Views.ContactController = Backbone.View.extend({
		events : {
			"click button" : "submitLead",	
			"change input": "fieldChanged",
			"change select": "selectionChanged",			
		},
		initialize : function(opts){
//			this.editing = ( opts.editing ) ? opts.editing : false;

			this.Contact = this.model.get("Contact");
			vent.on("update:Address", this.render, this );
		},
		selectionChanged: function(e){
			var field = $(e.currentTarget);
			var value = $("option:selected", field).val();
			var data = {};
			data[field.attr('id')] = value;
			this.Contact.set(data);
		},
		fieldChanged: function(e){
			var field = $(e.currentTarget);
			var data = {};
			data[field.attr('id')] = field.val();
			
			if ( field.attr('id') == 'AtFault' ){
				data[field.attr('id')] = parseInt( data[field.attr('id')] );
			}
			
			// keeping True and False Boolean 
			data[field.attr('id')] = ( data[field.attr('id')] == 'true' ) ? true : data[field.attr('id')];
			data[field.attr('id')] = ( data[field.attr('id')] == 'false' ) ? false : data[field.attr('id')];			
			data[field.attr('id')] = ( typeof data[field.attr('id')] == 'string' ) ? _.str.trim(data[field.attr('id')]) : data[field.attr('id')];
			this.Contact.set(data);
		},
		submitLead : function(){
			if ( window.$form.valid() ) {
				// set stuff....
				this.Contact.set("ResidenceStatus",this.$("#ResidenceStatus").val() );
				
				
				// kill stuff ... 
				// this.$el.fadeOut(500);

				var dongs =  json2xml(window.Lead.toJSONFull(),"");
				console.log(dongs);
				
				
				return; 
				
				
				$.ajax({
					url : "/submit",
					type : "POST",
					beforeSend: function(){
						console.log("the lead...");
						console.log( window.Lead.toJSONFull() );
					},
					data : window.Lead.toJSONFull(),
					success : function(data){
						console.log("success!");	
						console.log(data);
					},
					error : function(){
						console.log("error!");
					},
				});
			}
			return;					
		},
		template : template('contactTemplate'),
		render : function(){
			var data = this.Contact.toJSON();


			// get that first name + if there are no drivers, but there is a zip code...
			if ( this.model.get("Drivers").length > 0 ){
				data.name = _.str.words( this.model.get("Drivers").at(0).get("driverName") )[0];
			}else{ data.name = ''; }
			
			this.$el.html( this.template(data) );
			this.delegateEvents();
			return this;	
		}	
	});
	
	App.Views.Start = Backbone.View.extend({
		el : "#canvas",
		initialize : function(){
			console.log("App.Views.Start initialize()");
			this.AutoView = new App.Views.AutoController({ model : this.model });
			this.DriverView = new App.Views.DriverController({ model : this.model });
			this.CoverageView = new App.Views.CoverageController({ model : this.model });
			this.IncidentView = new App.Views.IncidentsController({ model : this.model });
			this.ContactView = new App.Views.ContactController({ model : this.model }); 
		},
		appAutos : function(){
			this.$el.empty().removeClass().addClass('panelAutos').html( this.AutoView.render().el );
		},
		appDrivers : function(){
			this.$el.empty().removeClass().addClass('panelDrivers').html( this.DriverView.render().el );
		},
		appCoverage : function(){
			this.$el.empty().removeClass().addClass('panelCoverage').html( this.CoverageView.render().el );
		},
		appIncidents : function(){
			this.$el.empty().removeClass().addClass('panelIncidents').html( this.IncidentView.render().el );	
		},
		appContact : function(){
			this.$el.empty().removeClass().addClass('panelContact').html( this.ContactView.render().el );
		},
	});	
	
	
	
	
	App.Views.MenuView = Backbone.View.extend({
		el : "#menuView",
		events : {
			"click a" : "navigate",
			"mouseover a" : "showEditIcon",
			"mouseout a"  : "hideEditIcon",
		},
		navigate : function(e){
			if ( $(e.currentTarget).hasClass("disabled") ){ e.preventDefault(); }
		},
		showEditIcon : function(e){
			$e = $(e.currentTarget);
	
			if ( $e.hasClass('btn-success') ){ return false; }
				$e.find('.icon-ok').removeClass('icon-ok').addClass('icon-edit');
		},
		hideEditIcon : function(e){
			$(e.currentTarget).find('.icon-edit').removeClass('icon-edit').addClass('icon-ok');
		},
		initialize : function(){
			this.check = '<i class="icon-ok icon-white" style="display:none" />';
			
			this.$buttons = this.$('a');
			this.$buttons.prepend(this.check).slice(1).addClass('disabled');
			
			this.model.get("Vehicles").on("add", this.update, this);
			this.model.get("Drivers").on("add", this.update, this);
			this.model.on("change:hasCoverage", this.update, this);
			this.model.on("change:hasIncidents", this.update, this);
			
			
			vent.on("navigate", this.setCurrent, this);
		},
		setCurrent : function(e){
			this.$buttons.removeClass('btn-success').find('.icon-white').removeClass('icon-white');
			this.$buttons.filter("[data-show="+e+"]").addClass('btn-success').find('i').addClass('icon-white');
		},
		update : function(){
			this.$buttons.filter('[data-show="autos"]').removeClass('disabled'); 
			
			if ( this.model.get("Vehicles").length > 0 ){ 
				this.$buttons.filter('[data-show="autos"]').find('i').show();
				this.$buttons.filter('[data-show="drivers"]').removeClass('disabled');
			};
			if ( this.model.get("Drivers").length > 0 ){ 
				this.$buttons.filter('[data-show="drivers"]').find('i').show();
				this.$buttons.filter('[data-show="coverage"]').removeClass('disabled');
			};
			if ( this.model.hasCoverage() ){ 
				this.$buttons.filter('[data-show="coverage"]').find('i').show();
				this.$buttons.filter('[data-show="incidents"]').removeClass('disabled');
			};
			if ( this.model.get("hasIncidents") ){ 
				this.$buttons.filter('[data-show="incidents"]').find('i').show();
				this.$buttons.filter('[data-show="contact"]').removeClass('disabled');//.prepend(this.check); 
			};
			
		},
		render : function(){
			this.update();
			return this;	
		}
	});
	
	

	
	
	App.Router = Backbone.Router.extend({
		routes : {
			''	: 'index',
			'autos' : 'routeAuto',
			'drivers' : 'routeDriver',
			'coverage' : 'routeCoverage',
			'incidents' : 'routeIncidents',
			'contact' : 'routeContact',
			':query' : 'notFound'			
		},
		initialize : function(){
			console.log('Router Initialize');
			window.AppStart = new App.Views.Start({ model : window.Lead });	
			new App.Views.MenuView({ model : window.Lead }).render();
		},
		index : function(){
			return this.navigate("autos",{trigger:true});
		},		
		notFound : function(){
			console.log("not found..");
			return this.navigate("autos",{trigger:true});
		},
		checkLocation : function(){
			
		},
		routeAuto : function(){
			vent.trigger("navigate","autos");
			return window.AppStart.appAutos();				
		},
		routeDriver : function(){
			var $this = this;
			
			if ( window.Lead.get("Vehicles").length == 0 ){
				return this.navigate("autos",{trigger:true});
			}else{
				vent.trigger("navigate","drivers");
				return window.AppStart.appDrivers();
			}
		},
		routeCoverage : function(){
			if ( window.Lead.get("Drivers").length == 0 ){
				return this.navigate("drivers",{trigger:true});
			}else{
				vent.trigger("navigate","coverage");
				return window.AppStart.appCoverage();
			}
		},
		routeIncidents : function(){
			if ( !window.Lead.hasCoverage() ){
				return this.navigate("coverage",{trigger:true});			
			}else{
				vent.trigger("navigate","incidents");
				return window.AppStart.appIncidents();		
			}
		},
		routeContact : function(){
			if ( window.Lead.get("hasIncidents") ){
				vent.trigger("navigate","contact");
				return window.AppStart.appContact();	
			}else{
				return this.navigate("autos",{trigger:true});
			}
		}
	});
})();