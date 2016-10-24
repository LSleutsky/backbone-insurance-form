(function(){
	//////////////////////////
	// MODELS
	/////////////////////////
	
	App.Models.Lead = Backbone.Model.extend({
		initialize : function(){
			this.set({
				Vehicles : new App.Collections.Vehicles,
				Drivers : new App.Collections.Drivers,
				Coverage : new App.Models.CoverageInfo,
				Incidents : new App.Collections.Incidents,
				Contact : new App.Models.ContactInfo,
			});
//			this.get("Drivers").add( new App.Models.Driver );
		},
		defaults : {
			hasCoverage : false,
			hasIncidents : false, // should be false
		},
		hasCoverage : function(){ return this.get("hasCoverage"); },
		hasIncidents : function(){ return this.get("hasIncidents"); },		
		hasContact : function(){ return !_.isUndefined(this.get("Contact")); },

		// trickery to make a functioning XML lead
		makeContactInfoJSON : function(){
			var ContactInfo = _.omit( this.get("Contact").toJSON(), ['OccupancyDate','OccupancyLength','ResidenceStatus','Garage'] ),
				name = _.str.words( this.get("Drivers").at(0).get("driverName") );
		
				ContactInfo.FirstName = _.first(name);
				ContactInfo.LastName  = _.rest(name).join(" ");
			return ContactInfo; 	
		},
		makeApplicantInfoJSON : function(){
			var ApplicantInfo = {}, contact = this.get("Contact");

			ApplicantInfo.Credit = {
				SelfRating : this.get("Drivers").at(0).get("SelfRating"),
				Repossessions : 0,
				Bankruptcy : 0
			}
			ApplicantInfo.Residence = {
				ResidenceStatus : contact.get("ResidenceStatus"),
				OccupancyDate : contact.get("OccupancyDate")
			};
			return ApplicantInfo;
		},
		makePersonsInfoJSON : function(){
			var PersonsInfo = {Person:[]};
			this.get("Drivers").each( function( person, i ){ PersonsInfo.Person.push(person.makePersonJSON()); });
			return PersonsInfo;
		},
		makeDriverInfoJSON : function(){
			var DriversInfo = {Driver:[]};
			this.get("Drivers").each( function( driver, i ){ 
				DriversInfo.Driver.push(driver.makeDriverJSON()); 
			});
			return DriversInfo;
		},
		makeCoverageInfoJSON : function(){
			var CoverageInfo = {},
				$coverage = this.get("Coverage").toJSON();

			CoverageInfo = {
				CurrentlyInsured : $coverage.currentlyInsured,
				DesiredCoverage	: '',
				DesiredInjuryCoverage : '',
			}
			if ( CoverageInfo.CurrentlyInsured == "1" ){
				CoverageInfo.CurrentInsurance = {
					InsuranceCompany : $coverage.insuranceCompany,
					StartDate : "",
					EndDate : "",
//					Premium : 0,
//					Liability : "",
				}	
			}
			return CoverageInfo;		
		},
		makeVehicleInfoJSON	: function(){
			var vehicles = {Vehicle:[]};
			this.get("Vehicles").each( function( vehicle,i ){ vehicles.Vehicle.push(vehicle.makeVehicleJSON());	});
			return vehicles;
		},
		// putting all the trickery together
		toJSONFull : function(){
			var $that = {Lead:{}};

			
			alert('JSON data would get posted to an API on form submission');
			return $that; 
			//this.toJSON();
			
		},
	});
	
	
	
	
	//////////////////////////////
	///  Coverage Model 
	/////////////////////////////
	App.Models.CoverageInfo = Backbone.Model.extend({
		defaults : {
			insuranceCompany : "",
//			insuranceCompany : "Hanover Insurance Co",
			currentlyInsured : "1",
			coverageLength : "3 years",
			coverageContinuos : "6 months",
			coverageExpires : "",
//			Liability : 'standard'
		}	
	});
	
	//////////////////////////////
	///  Contact Info Model 
	/////////////////////////////
 	App.Models.ContactInfo = Backbone.Model.extend({
		initialize : function(){
//			this.on('change:ZipCode', this.updateAddress, this );
			this.on('change:OccupancyLength', this.updateOccupancyDate, this );
			this.updateOccupancyDate();
		},
		updateAddress : function(){
			var $this = this,
				zip = this.get("ZipCode");
				url = 'http://www.cashhelponline.com/api/zip/'+zip,
				city = state = '';
	
			processData = function(data){
				city = data.city;
				state = data.state;
				$this.set("City",city);
				$this.set("State",state);
				vent.trigger("update:Address");
			};
			
			$.ajax({
				type	: 'GET',
				url		: url,
				success	: function(data){ processData(data); }	
			});

		},
		updateOccupancyDate : function(){ return this.set("OccupancyDate",moment().subtract('months',this.get("OccupancyLength")).format('YYYY-MM-DD')); },
		defaults : {
			OccupancyDate : "",
			OccupancyLength : "48",
			ResidenceStatus : "",
			Garage : true,
			Email : "",
			ZipCode : "",
			Address : "",
			Address2 : "",
			City : "",
			State : "",
			Phone : "",
		}	
	});
	
	//////////////////////////////
	///  Vehicle Model 
	/////////////////////////////
	App.Models.Vehicle = Backbone.Model.extend({
		initialize : function(){},
		resetAuto : function(){
			this.set({
				year : '',
				make : '',
				model : '',
				trim : ''
			});
		},
		makeVehicleJSON : function(){
			var data = {}, $this = this.toJSON();
			return data = {
				Id 			: $this.id,
				Year	 	: $this.year,
				Make 		: $this.make,
				Model		: $this.model,
				Submodel	: 'SUBMODEL',
				VIN 		: 'xxVINxx',
				Ownership	: $this.Ownership,
				Rental 		: 0,
				Towing 		: 0,
				Salvaged 	: 0,
				Garage 		: 'Driveway',
				VehicleUse 	: {
				   AnnualMileage 		: $this.averageMiles,
				   WeeklyCommuteDays	: $this.WeeklyCommuteDays,
				   DailyCommuteMiles	: $this.howFar,
                   MainUsage			: $this.doesWorkSchool
				},
				CollisionDeductible 	: $this.CollisionDeductible,
				ComprehensiveDeductible : $this.ComprehensiveDeductible
			};
//			return data;
		},
		defaults : { 
			year : '',
			make : '',
			model : '',
			trim : '',
			doesWorkSchool : "CommuteWork",
			Ownership : "Owned",
			WeeklyCommuteDays : 5,
			howFar : 20,
			CollisionDeductible : 500,
			ComprehensiveDeductible : 500,
			averageMiles : 5000,
		 },
	});
	
	//////////////////////////////
	///  Driver Model 
	/////////////////////////////
	App.Models.Driver = Backbone.Model.extend({
		initialize : function(){
			this.on("change:BirthDate", this.birthdayChange, this);	
			this.birthdayChange();
		},
		birthdayChange : function(){
			if ( _.isUndefined( this.get("BirthDate") )){ return false; }
			this.set("BirthDate", this.getZeroBirthday(), {silent:true} );
			this.set("BirthDateFormatted", this.getBirthdayFormat() );
			this.setAge();
			return this;
		},
		getZeroBirthday : function(){
			var bparts = this.get("BirthDate").split("/");
			return ( _.str.lpad(bparts[0], 2, '0') + '/' + _.str.lpad(bparts[1], 2, '0') + '/' + bparts[2] );
		},
		getBirthdayFormat : function(){
			var bparts = this.get("BirthDate").split("/");
			return ( bparts[2] + '-' + _.str.lpad(bparts[0], 2, '0') + '-' + _.str.lpad(bparts[1], 2, '0') );
		},
		setAge : function(){
			var value = this.get("BirthDate");
			var re = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
			function calcAge(dateString) {
				var birthday = +new Date(dateString);
				return ~~((Date.now() - birthday) / (31557600000));
			}
		
			if( re.test(value)) {
				var adata = value.split('/'), mm = parseInt(adata[0],10), gg = parseInt(adata[1],10), aaaa = parseInt(adata[2],10), xdata = new Date(aaaa,mm-1,gg);
				this.set("age",calcAge(xdata));
//				if ( calcAge(xdata) >= 18 && calcAge(xdata) <= 150 ){ this.set("age",calcAge(xdata)); } 
			}
		},
		defaults : {
			firstLicense : 16,
			Education : 'BachelorsDegree',
			activeLicense : true,
			licenseState : '',
			sr22 : false,
			EverSuspended : '0',
			MilitaryExperience : 'NoMilitaryExperience',
			YearsInField : 2,
			SelfRating : 'Good',
			Occupation : 'Retail'
		},
		getDrivingRecordJSON : function(){
			var data = {
				Tickets : { Ticket : [] },
				DUIS : { DUI : [] },
				Claims : { Claim : [] },
				Accidents : { Accident : [] }
			};
			var incidents = window.Lead.get("Incidents").where({'incidentDriver':this.id});

			_.each( incidents, function( incident ){
				var $inc = incident.toJSON(), info = {};

				if ( $inc.incidentType == 'ticket' ){  data.Tickets.Ticket.push({ Date : $inc.incidentDate, Description : $inc.description	});	}
				else if ( $inc.incidentType == 'dui' ){ data.DUIS.DUI.push({ Date : $inc.incidentDate, Description : $inc.description, State : $inc.State	});	}
				else if ( $inc.incidentType == 'accident' || $inc.incidentType == 'claim' ){
					info = {
						Date : $inc.incidentDate,
						InsurancePaidAmount : $inc.InsurancePaidAmount,	
						WhatDamaged : $inc.WhatDamaged,
						Description : $inc.description,
						AtFault : $inc.AtFault 
					};
					if ( $inc.incidentType == 'accident' ){ data.Accidents.Accident.push(info); }
					if ( $inc.incidentType == 'claim'    ){ data.Claims.Claim.push(info); }
				}
			});
			return data;
		},
		makeDriverJSON : function(){
			var DriverInfo = {}; 

				DriverInfo.Id = this.get('id');
				DriverInfo.PersonId = this.get('id');
				DriverInfo.VehicleId = ( this.get('primary') ) ? this.get('primary') : 0;
				DriverInfo.StudentGpa = "Unknown",
				DriverInfo.Sr22Filing = (this.get("sr22")) ? "1" : "0",
				DriverInfo.DriversLicense = {
					Age : this.get('firstLicense'),
					Status : ( this.get("activeLicense") ) ? "ValidLicense" : "NotLicensed",
					State : this.get("licenseState"),
					EverSuspended : this.get("EverSuspended")
				};
				DriverInfo.DrivingRecord = this.getDrivingRecordJSON();
			return DriverInfo;
		},
		makePersonJSON : function(){
			var PersonInfo = this.toJSON(), 
				name = _.str.words( this.get("driverName"));

				PersonInfo.FirstName = _.first(name);
				PersonInfo.LastName  = _.rest(name).join(" ");
				PersonInfo.Id = PersonInfo.id; 
				PersonInfo.UsResident = 1;
				PersonInfo.BirthDate = this.get("BirthDateFormatted");

			return _.omit( PersonInfo, ['id','age','driverName','activeLicense','firstLicense','primary','sr22'] );
		}
	});
	
	//////////////////////////////
	// Incident Model 
	//////////////////////////////
	App.Models.Incident = Backbone.Model.extend({
		initialize : function(){
			this.on('change:incidentType', this.changingType, this );
			this.on('change:incidentDriver', this.forceDriver, this );
		},
		forceDriver : function(){
			return this.set('incidentDriver', parseInt( this.get('incidentDriver') ));
		},
		changingType : function( ){
			var iType = this.get("incidentType");

			if ( iType == 'ticket' || iType == 'dui' ){
				this.unset('State');
				this.unset('AtFault');
				this.unset('WhatDamaged');
				this.unset('InsurancePaidAmount');			
			}else if ( iType == 'claim' ||  iType == 'accident' ){
				this.unset('State');
				this.set('InsurancePaidAmount', 500 );
				this.set('WhatDamaged','Property');
				this.set('AtFault',0);
			}
			if ( iType == 'dui' ){ this.set('State',''); }
		},
		defaults : {
			incidentDriver : 1,
			incidentDate : '',
			incidentType : 'dui',
			description : '',
			State : ''
		}
		
	});

	//////////////////////////
	// COLLECTIONS
	/////////////////////////
	App.Collections.Vehicles = Backbone.Collection.extend({
		initialize : function(){
			this.on('add remove', this.resetIDs, this );
		},
		resetIDs : function(){
			this.each( function( m, i ){
				m.set({ id : i+1 });
			});	
		},
		model : App.Models.Vehicle
	});
	App.Collections.Drivers = Backbone.Collection.extend({
		initialize : function(){
			this.on('add remove', this.resetIDs, this );
		},
		resetIDs : function(){
			this.each( function( m, i ){
				m.set({ id : i+1 });
				if ( i+1 == 1 ){ m.set({ RelationshipToApplicant : 'Self' });	}
			});	
		},		
		model : App.Models.Driver
	});
	
	App.Collections.Incidents = Backbone.Collection.extend({
		initialize : function(){
			this.on('add remove', this.resetIDs, this );
		},
		resetIDs : function(){
			this.each( function( m, i ){
				m.set({ id : i+1 });
			});	
		},
		model : App.Models.Incident	
	});
})();