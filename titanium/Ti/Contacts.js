define(["Ti/_/Evented", "Ti/_/lang"], function(Evented, lang) {
	var _getTizenObjectType = function(types) {
			var i = 0, typesLength = 0, type = "";
			typesLength = types.length;
			for (i = 0; i < typesLength; i++) {
				if ((types[i].toLowerCase() == "work") || (types[i].toLowerCase() == "home")) {
					type = types[i].toLowerCase();
					break;
				}
			}
			type = type || "other";
			return type;
		},		
		_getTizenPhoneType = function(types) {
			var i = 0, typesLength = types.length, type = "", typeName = "";
			for (i = 0; i < typesLength; i++) {
				typeName = types[i].toLowerCase();
				if ((typeName == "home") || (typeName == "work") || (typeName == "mobile") || (typeName == "pager") || (typeName == "workFax") ||(typeName == "homeFax") || (typeName == "iPohne")) {
					type = typeName;
					break;
				}
				if (typeName == "pref") {
					type = "main";
					break;
				}
			}
			type = type || "other";
			return type;	
		},
		_getTizenWebSiteType = function(types) {
			var i = 0, typesLength = types.length, type = "", typeName = "";

			typeName = types.toLowerCase();
				if ((typeName == "homepage") || (typeName == "home") || (typeName == "work")) {
					type = typeName;
			}
			type = type || "other";
			return type;
		},
		_mapAddressesFromTizen = function(tizenContact) {
			var result = {}, flag = true, address = null, type = "", i = 0;
			while (flag) {
				address = tizenContact.addresses[i];
				i++;
				if (address) {
					type = _getTizenObjectType(address.types);
					result[type] ? result[type].push({
						CountryCode: "",
						Street: address.streetAddress || "",
						City: address.city || "",
						County: "",
						State: address.region || "",
						Country: address.country || "",
						ZIP: address.postalCode || ""
					}) : result[type] = [{
						CountryCode: "",
						Street: address.streetAddress || "",
						City: address.city || "",
						County: "",
						State: address.region || "",
						Country: address.country || "",
						ZIP: address.postalCode || ""						
					}];
				} else {
					flag = false;
				}
			}
			return result;
		},	
		_mapAddressesFromTitanium = function(person) {
			var result = [], address = person.address,
				addressTypes = ['home', 'work'], i = 0, j= 0, currentAddress = null;
			if (address) {
				for (i in addressTypes) {
					currentAddress = address[addressTypes[i]];
					if (currentAddress) {
						for (j in currentAddress) {
							result.push(new tizen.ContactAddress({
								streetAddress: currentAddress[j].Street || '',
								city: currentAddress[j].City || '',
								region: currentAddress[j].State || '',
								country: currentAddress[j].Country || '',
								postalCode: currentAddress[j].ZIP || '',
								types: [addressTypes[i].toUpperCase()]
							}));							
						}
					}					
				}
			}
			return result;
		},
		_mapEmailsFromTizen = function (tizenContact) {
			var result = {}, i = 0, flag = true, email = null, type = "";
			while (flag) {
				if (! tizenContact.emails) {
					flag = false;
					continue;
				}
				email = tizenContact.emails[i];
				i++;
				if (email) {
					type = _getTizenObjectType(email.types);
					result[type] ? result[type].push(email.email) :result[type] = [email.email];
				} else {
					flag = false;
				}
			}
			return result;
		},	
		_mapEmailsFromTitanium = function(person) {
			var result = undefined, emails = person.email, email = "",
				emailTypes = ['home', 'work'], i = 0, j = 0, currentEmail = null;
			if (emails) {
				for(i in emailTypes) {
					currentEmail = emails[emailTypes[i]]; 
					if (currentEmail) {
						result = result || [];
						for (j in currentEmail) {
							result.push(new tizen.ContactEmailAddress(
									currentEmail[j],
									[emailTypes[i].toUpperCase()]
								));
						}
					}
				}
			}
			return result;
		},
		_mapPhoneNumbersFromTizen = function(tizenContact) {
			var result = {}, i = 0, flag = true, phoneNumber = null, type = "";
			while (flag) {
				if (! tizenContact.phoneNumbers) {
					flag = false;
					continue;
				}				
				phoneNumber = tizenContact.phoneNumbers[i];
				i++;
				if (phoneNumber) {
					type = _getTizenPhoneType(phoneNumber.types);
					result[type] ? result[type].push(phoneNumber.number) : result[type] = [phoneNumber.number];
				} else {
					flag = false;
				}
				
			}
			return result;
		},
		_mapPhoneNumbersFromTitanium = function(person){
			var result = undefined, phoneNumbers = person.phone,
				numberTypes = ['work', 'home', 'mobile', 'pager'], currentNumber = null, i = 0, j = 0;
			if (phoneNumbers) {
				for (i in numberTypes) {
					currentNumber = phoneNumbers[numberTypes[i]];
					if (currentNumber) {
						result = result || [];
						for (j in currentNumber) {
							result.push(new tizen.ContactPhoneNumber(
									currentNumber[j],
									[(numberTypes[i] == 'mobile') ? 'CELL' : numberTypes[i].toUpperCase()]
							));							
						}
					}
				}
			}
			return result;
		},
		_mapAnniversaryFromTizen = function(tizenContact) {
			var result = {}, flag = true, anniversary = null, i = 0;
			while(flag) {
				if (tizenContact.anniversaries === null) {
					flag = false;
					continue;
				}
				anniversary = tizenContact.anniversaries[i];
				if (anniversary) {
					if (anniversary.label && (anniversary.label == "anniversary")) {
						result.anniversary ? result.anniversary.push(new Date(anniversary.date).toUTCString()) : result.anniversary = [new Date(anniversary.date).toUTCString()];
					} else {
						result.other ? result.other.push(new Date(anniversary.date).toUTCString()) : result.other = [new Date(anniversary.date).toUTCString()];
					}
				} else {
					flag = false;
				}
				i++;
			}
			return result;
		},
		_mapAnniversariesFromTitanium = function(person) {
			var result, anniversaries = person.date,
				anniversaryTypes = ['anniversary', 'other'], i = 0, j= 0, currentAnniversary = null;
			if (anniversaries) {
				for (i in anniversaryTypes) {
					currentAnniversary = anniversaries[anniversaryTypes[i]];
					if (currentAnniversary) {
						result = result || [];
						for (j in currentAnniversary) {
							result.push(new tizen.ContactAnniversary(new Date(currentAnniversary[j]),anniversaryTypes[i]));
						}
					}
				}
			}
			return result;
		},
		_mapWebSitesFromTizen = function(tizenContact) {
			var result = {}, flag = true, i = 0, webSite = null, type = "";
			while (flag) {
				webSite = tizenContact.urls[i];
				if (webSite) {
					type = _getTizenWebSiteType(webSite.type);
					result[type] ? result[type].push(webSite.url) : result[type] = [webSite.url];
				} else {
					flag = false;
				}
				i++;
			}
			return result;
		},
		_mapWebSitesFromTitanium = function(person) {
			var result = undefined, webSites = person.url, currentWebSite = null, i = 0;
			if (webSites) {
				currentWebSite = webSites.homepage;
				if (currentWebSite) {
					result = result || [];
					for (i in currentWebSite) {
						result.push(new tizen.ContactWebSite(currentWebSite[i], 'HOMEPAGE'));						
					}
				}
			}	
			return result;
		},
		
		_mapImageFromTizen = function(uri){
			if(!uri) return null;
			var client = Ti.Network.createHTTPClient({
				onload: function(e){

				},
				onerror: function(){}
			});
			client.open("GET", uri, false);	
			client.send();
			return client.responseData;
		};		
		
	
		
	return lang.setObject("Ti.Contacts", Evented, {
		
		_mapContactFromTizen: function(tizenContact) {
			var name = null,
				person = new (require("Ti/Contacts/Person"))();
			person.address = _mapAddressesFromTizen(tizenContact);
			person.email = _mapEmailsFromTizen(tizenContact);
			if (tizenContact.name) {
				name = tizenContact.name;
				person.firstName = name.firstName || '';
				person.middleName = name.middleName || '';
				person.lastName = name.lastName || '';
				person.nickname = name.nicknames[0] || '';
				person.firstPhonetic = name.phoneticFirstName || '';
				person.lastPhonetic = name.phoneticLastName || '';	
			}
			person.phone = _mapPhoneNumbersFromTizen(tizenContact);
			person.birthday = tizenContact.birthday ? new Date(tizenContact.birthday).toUTCString() : null;
			person.organization = (tizenContact.organization && tizenContact.organization.name) ? tizenContact.organization.name : '';
			person.department = (tizenContact.organization && tizenContact.organization.department) ? tizenContact.organization.department : '';
			person.jobTitle = (tizenContact.organization && tizenContact.organization.title) ? tizenContact.organization.title : '';
			person.date = _mapAnniversaryFromTizen(tizenContact);  
			person.note = tizenContact.note || '';
			person.url = _mapWebSitesFromTizen(tizenContact);
			person.id = tizenContact.id || 0;
			person.image = _mapImageFromTizen(tizenContact.photoURI);
			return person;		
		},
		
		_mapContactFromTitanium: function(person, groupName) {
			var tizenContact = new tizen.Contact({
					addresses: _mapAddressesFromTitanium(person),
					emails: _mapEmailsFromTitanium(person),
					name: new tizen.ContactName({
						prefix: person.prefix || undefined,
						firstName: person.firstName || undefined,
						middleName: person.middleName || undefined,
						lastName: person.lastName || undefined,
						nicknames: (person.nickname) ? [person.nickname] : undefined,
						phoneticFirstName: person.firstPhonetic || undefined,
						phoneticLastName: person.lastPhonetic || undefined
					}),
					phoneNumbers: _mapPhoneNumbersFromTitanium(person),
					birthday: person.birthday ? new Date(person.birthday) : undefined,
					organization: new tizen.ContactOrganization({
						name: person.organization || undefined,
						department: person.department || undefined,
						title: person.jobTitle || undefined,
					}),
					anniversaries: _mapAnniversariesFromTitanium(person),
					note: person.note || undefined,
					urls: _mapWebSitesFromTitanium(person),
				});	
			groupName && tizenContact.categories && (Object.prototype.toString.call(tizenContact.categories) === '[object Array]') 
				? tizenContact.categories.push(groupName)
				: tizenContact.categories = [groupName];
			return tizenContact;
		},
		
		constants: {
			AUTHORIZATION_UNKNOWN: 0,
			AUTHORIZATION_DENIED: 1,
			AUTHORIZATION_RESTRICTED: 2,
			AUTHORIZATION_AUTHORIZE: 3,
			
			CONTACTS_SORT_FIRST_NAME: 0,
			CONTACTS_SORT_LAST_NAME: 1,
			
			contactsAuthorization: this.AUTHORIZATION_AUTHORIZE			
		},
		
		createGroup: function(args) {
			throw new Error('This method is not supported on Tizen.');
		},
		
		createPerson: function(person) {
			var addressBook = tizen.contact.getDefaultAddressBook(),   
				tizenContact = this._mapContactFromTitanium(person);
			addressBook.add(tizenContact);
			person = new (require("Ti/Contacts/Person"))();
			person = _mapContactFromTizen(tizenContact, person);	
			return person;
		},
		
		getAllGroups: function() {
			var addressbook = tizen.contact.getDefaultAddressBook(), groups = [];
			try {
				groups = addressbook.getCategories();
			} catch (e) {
				console.log('Error occurs: ' + e.type + ' ' + e.message);
			}
			return groups;
		},
		
		
		getAllPeople: function() {
			throw new Error('This function is not supported here. Use Ti.Contacts.Tizen.getAllPeople instead.');
		},
		
		getGroupById: function(id) { 
			throw new Error('This function is not supported on Tizen. Use getAllGroups instead.');
		},
		getPeopleWithName: function(name) {
			throw new Error('This function is not supported here. Use Ti.Contacts.Tizen.getPeopleWithName instead.');
		},
		
		getPersonById: function(id) {
			var addressBook = null, contact = null, result = {}, person = {};
			try {
				addressBook = tizen.contact.getDefaultAddressBook();
				contact = addressBook.get(id);	
			} catch (err) {
				console.log("Error: " + err.name);
			}
			person = _mapContactFromTizen(contact);				
			return person;
		},
		
		removeGroup: function(Group) {
			throw new Error('This method is not supported here. Use Ti.Contacts.Tizen.removeGroup instead.');
		},
		
		removePerson: function(Person) {
			var addressBook = tizen.contact.getDefaultAddressBook();
			try {
				addressBook.remove(Person.id);
			} catch (err) {
				console.log('The following error occurred while removing: ' +  err.name);
			}
		}
		
	});
});