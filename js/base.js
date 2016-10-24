// APP Base
(function(){
	
	window.App = {
		Settings : {},
		Models : {},
		Collections : {},
		Views : {},
		Router : {}
	};
	// template helper
	window.template = function(id) {
		return _.template( $('#' + id).html());
	};
	window.vent = _.extend({}, Backbone.Events);	
	
	window.App.Settings.Makes = [
		'ACURA',
		'ALFA ROMEO',
		'AUDI',
		'BENTLEY',
		'BMW',
		'BUICK',
		'CADILLAC',
		'CHEVROLET',
		'CHRYSLER',
		'DODGE',
		'EAGLE',
		'FERRARI',
		'FORD',
		'GEO',
		'GMC',
		'HONDA',
		'HYUNDAI',
		'INFINITI',
		'ISUZU',
		'JAGUAR',
		'JEEP',
		'LADA',
		'LAMBORGHINI',
		'LAND ROVER',
		'LEXUS',
		'NISSAN',
		'TOYOTA'
	];
	
	window.App.Settings.Models = [
		'MODEL A',
		'MODEL B',
		'C TYPE',
		'D TYPE',
		'CLASS E',
		'CLASS F',
		'TRUCK G',
		'TRUCK H',
		'TRUCK I',
		'MODEL J'
	];
	
	
	window.App.Settings.FirstLicense = [];
	for ( var i = 16 ; i <= 80 ; i++ ){ window.App.Settings.FirstLicense.push( i );	}
	
	window.App.Settings.Education = [ "HighSchoolDiploma", "AssociateDegree", "BachelorsDegree", "MastersDegree", "DoctorateDegree"]; 

	window.App.Settings.ResidenceStatus = [ "Own", "Rent", "LiveWithParents", "Dormitory", "ChoiceNotListed", "Unknown" ];
	window.App.Settings.States = {AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming'};

	window.App.Settings.ResidenceLength = [
		{
			name : "Less than 1 year",
			value : "6"
		},
		{
			name : "1 Year",
			value : "12",	
		},
		{
			name : "2 Years",
			value : "24",	
		},	
		{
			name : "3 to 5 Years",
			value : "48",	
		},
		{
			name : "5 to 10 Years",
			value : "84",	
		},
		{
			name : "More than 10 Years",
			value : "121",	
		}
	];
	
//	window.App.Settings.CreditRatings = ['excellent','good','average','below average','poor'];
	window.App.Settings.CreditRatings = ['Excellent','Good','Poor','Unsure'];
	

	window.App.Settings.CoverageCompanies = [ "21st Century Insurance", "AAA Insurance Co.", "AIG", "Alfa", "Allied Group", "Allstate Insurance Co", "Amco Insurance Co", "American Alliance Insurance Co", "American Economy Insurance Co", "American Family", "American Manufacturers Mutual", "American National Property and Casualty", "American Reliable Insurance Co", "Amex Assurance Co", "Amica Mutual Insurance Co", "Atlanta Casualty", "Atlantic Mutual Co", "Brooke Insurance", "Calfarm Insurance Co", "California Automobile Insurance Co", "California Casualty and Fire Insurance Co", "California State Auto Assoc", "Century National Insurance", "Chubb Group of Insurance Co", "CNA", "Colonial Penn", "Commerce West", "Continental Insurance Co", "Cotton States", "Country Financial", "Eagle Insurance Co", "Electric Insurance Co.", "Erie Insurance", "Esurance", "Explorer Insurance Co", "Farm Bureau/Farm Family/Rural", "Farmers Insurance", "Federal Insurance Co", "Financial Indemnity", "Geico", "General Accident Insurance", "Great American Insurance Co", "Hanover Insurance Co", "Hartford Insurance Co", "High Point Insurance", "Infinity Insurance Co", "Insurance Co of the West", "Kemper", "Leader National", "Liberty Mutual Insurance", "Lumbermans Mutual Insurance", "Maryland Casualty", "Mercury Insurance Co", "MetLife", "Mutual of Omaha", "Nationwide Insurance", "NJ Skylands Insurance", "Northwestern Pacific Indemnity", "Ohio Casualty", "Omni Insurance", "Orion Auto Insurance Co", "Other", "Pemco", "Progressive Casualty", "Progressive Insurance", "Prudential", "Safeco", "Selective InsGroup", "Sentry Insurance", "Shelter Insurance Co.", "State Auto Insurance Co", "State Farm", "TIG Insurance Group", "Travlers Insurance", "Unigard Insurance", "Unitrin", "USAA", "Workmens Auto Insurance" ];


	window.App.Settings.Deductibles = [ "0", "50", "100", "250", "500", "1000", "2500", "5000" ];
	window.App.Settings.Liability = [ "State Minimum", "$25,000 / $50,000 / $10,000", "$50,000 / $100,000 / $25,000", "$100,000 / $300,000 / $50,000", "$250,000 / $500,000 / $100,000", "$500,000 / $100,000,000 / $100,000+", "$100,000,000 / $100,000,000 / $100,000+", "Not Sure" ];
	
	window.App.Settings.Coverage = [
		{ 
			name : 'minimum',
			info : {
				body 	 : '$15,000 / $30,000',
				property : '$5,000',
				medical  : 'You pay',
				roadside : 'You pay'
			}
		},
		{
			name : 'standard',
			info : {
				body 	 : '$100,000 / $300,000',
				property : '$50,000',
				medical  : 'Insurance pays',
				roadside : 'Insurance pays'
			}
		},
		{
			name : 'premium',
			info : {
				body 	 : '$250,000 / $500,000',
				property : '$100,000',
				medical  : 'Insurance pays',
				roadside : 'Insurance pays'				
			}
		}
	];

	window.App.Settings.CoverageContinuous = [
		{
			name : "Less than 6 months",
			value : "less than 6"	
		},
		{
			name : "6 months",
			value : "6 months"	
		},
		{
			name : "1 Year",
			value : "1 year"	
		},	
		{
			name : "2 Years",
			value : "2 years"	
		},		
		{
			name : "3 Years",
			value : "3 years"
		},		
		{
			name : "3 to 5 Years",
			value : "3to5 years"	
		}
	];

	window.App.Settings.CoverageLength = [
		{
			name : "Less than 6 months",
			value : "less than 6"	
		},
		{
			name : "6 months",
			value : "6 months"	
		},
		{
			name : "1 Year",
			value : "1 year"	
		},	
		{
			name : "2 Years",
			value : "2 years"	
		},		
		{
			name : "3 Years",
			value : "3 years"
		},		
		{
			name : "Over 3 Years",
			value : "more than 3"	
		}
	];	
	
	window.App.Settings.CoverageExpires = [
		{
			name : "Not Sure",
			value : "not sure"	
		},
		{
			name : "A few days",
			value : "a few days"	
		},
		{
			name : "2 weeks",
			value : "2 weeks"	
		},	
		{
			name : "1 month",
			value : "1 month"
		},		
		{
			name : "2 months",
			value : "2 months"
		},		
		{
			name : "3 months",
			value : "3 months"
		},	
		{
			name : "4 to 6 months",
			value : "4to6 months"
		},
		{
			name : "Over 6 months",
			value : "over6 months"
		}
	];	
	
	window.App.Settings.Occupations = [ "AdministrativeClerical", "Architect", "CertifiedPublicAccountant", "Clergy", "ConstructionTrades", "Dentist", "Disabled", "Engineer", "Homemaker", "Lawyer", "ManagerSupervisor", "MilitaryOfficer", "MilitaryEnlisted", "OtherNonTechnical", "OtherTechnical", "Physician", "ProfessionalSalaried", "Professor", "Retail", "Retired", "SalesInside", "SalesOutside", "SchoolTeacher", "Scientist", "SelfEmployed", "SkilledSemiSkilled", "Student", "Unemployed" ];


	window.App.Settings.IncidentTypes = [
		{
			name : 'DUI',
			value : 'dui'
		},
		{
			name : 'Traffic Ticket',
			value : 'ticket'
		},
		{
			name : 'Insurance Claim',
			value : 'claim'	
		},
		{
			name : 'At Fault Accident',
			value : 'accident'	
		},
	];
	
	window.App.Settings.DUI =  [ "DrivingUnderInfluenceOfAlcolholOrWhileIntoxicated", "DrivingWhileUnderTheInfluenceOfDrugs" ];
	window.App.Settings.Tickets = ["CarelessDriving", "DefectiveEquipment", "FailureToObeySignal", "SpeedingViolation", "TicketViolationNotListed"];
	window.App.Settings.Claims =  ["FireHailWaterDamage", "VandalismDamage", "VehicleHitAnimal", "VehicleStolen", "WindshieldDamage", "LossClaimNotListed"];
	window.App.Settings.Accidents = [ "VehicleHitVehicle", "VehicleHitPedestrian", "VehicleHitProperty", "VehicleDamagedAvoidingAccident", "OtherVehicleHitYours", "AtFaultAccidentNotListed", "NotAtFaultAccidentNotListed"];
	window.App.Settings.WhatDamaged = [ "People", "Property", "Both", "NotApplicable" ];
	
	window.App.Settings.PaidAmount = [
	{
		name : "Less than $500",
		value : "500"
	},
	{
		name : "$500 to $1,000",
		value : "750"
	},
	{
		name : "$1,000 to $2,000",
		value : "1500"
	},
	{
		name : "$2,000 to $5,000",
		value : "4000"
	},
	{
		name : "$10,000",
		value : "10000"
	},
	{
		name : "$20,000",
		value : "20000"
	},
	{
		name : "$30,000",
		value : "30000"
	},
	{
		name : "Over $30,000",
		value : "30001"
	}
	];
	
})();