UserProfiles = new Mongo.Collection("profiles");

if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({
    userProfile: function() {
    	var viewing = Session.get("viewing");
    	if (viewing){
			  Meteor.subscribe("profiles", viewing);
    		return UserProfiles.find({});
    	}
    	else{
	    	Meteor.subscribe("profiles", Meteor.user().username);
	    	return UserProfiles.find({});
    	}
    },
    emptyViewHelper: function(){
    	if (Session.get("viewing")) return true;
    	else return false;
    },
    isUser: function(){
      return UserProfiles.find({}).fetch()[0].uid === Meteor.userId();
    }
  });
  Template.nav.events({
  	"submit #searchForm": function (event){
  		event.preventDefault();
  		Session.set("viewing", event.target.searchInput.value);
  		event.target.searchInput.value = "";
  		return false;
  	},
  	"click #profileButton": function(){
  		Session.set("viewing", Meteor.user().username);
  	},
    "click #requests": function(){

    }
  });
  Template.nav.helpers({
    requestsTotal: function(){
      var found = UserProfiles.find({}).fetch();
      if (found[0].uid === Meteor.userId()) Session.set("fRequests", found[0].fRequests.length);
      return Session.get("fRequests");
    }
  })
  Template.userInfo.helpers({
 	compareProfile: function(){
 		return this.uid === Meteor.userId();
 	}
  });
  Template.userAbout.helpers({
  	compareProfile: function(){
  		return this.uid === Meteor.userId();
  	}
  });
  Template.profile.helpers({
  	compareProfile: function(){
  		return this.uid !== Meteor.userId();
  	},
  	isFriend: function(){
  		var friends = Meteor.user().friends;
  		if (friends){
  			friends.forEach(function(friend){
  				if (friend == this.uid){
  					return true;
  				}
  			});
  			return false;
  		}
  		else{
  			return false;
  		}
  	}
  });
  Template.profile.events({
  	"click #requestAdd": function(){
  		Meteor.call("requestAdd", this._id);
  	}
  })
  Template.createProfile.events({
  	"submit form": function (event){
  		event.preventDefault();
  		var params = {};
  		params.first = event.target.firstName.value;
  		params.last = event.target.lastName.value;
  		params.name = params.first + " " + params.last;
  		params.email = event.target.email.value;
  		params.username = Meteor.user().username;
  		params.city = "";
  		params.about = "Bacon ipsum dolor amet short loin filet mignon ham bacon fatback. Sirloin strip steak shankle cupim ground round sausage meatball pig kevin porchetta andouille boudin spare ribs salami filet mignon. Pig ribeye pork, tail cupim pork belly meatloaf porchetta filet mignon beef spare ribs ham hock. Picanha flank tail, landjaeger filet mignon spare ribs pig venison meatloaf pork chop porchetta bresaola capicola chuck.";
  		params.education = "Bacon ipsum dolor amet short loin filet mignon ham bacon fatback. Sirloin strip steak shankle cupim ground round sausage meatball pig kevin porchetta andouille boudin spare ribs salami filet mignon. Pig ribeye pork, tail cupim pork belly meatloaf porchetta filet mignon beef spare ribs ham hock. Picanha flank tail, landjaeger filet mignon spare ribs pig venison meatloaf pork chop porchetta bresaola capicola chuck.";
  		params.work = "Bacon ipsum dolor amet short loin filet mignon ham bacon fatback. Sirloin strip steak shankle cupim ground round sausage meatball pig kevin porchetta andouille boudin spare ribs salami filet mignon. Pig ribeye pork, tail cupim pork belly meatloaf porchetta filet mignon beef spare ribs ham hock. Picanha flank tail, landjaeger filet mignon spare ribs pig venison meatloaf pork chop porchetta bresaola capicola chuck.";
  		params.infoEditing = false;
  		params.aboutEditing = false;
  		params.fRequests = [];
  		params.cRequests = [];
  		params.lastModified = new Date();
  		params.uid = Meteor.userId();
  		Meteor.call("newProfile", params);
  		event.target.firstName.value = "";
  		event.target.lastName.value = "";
  		event.target.email.value = "";
  		return false;
  	}
  });
  Template.userInfo.events({
  	"click #infoEdit": function(){
  		Meteor.call("toggleEdit", this._id);
  	},
  	"submit .userInfoForm": function (event){
  		event.preventDefault();
  		var params = {};
  		params.first = event.target.firstName.value;
  		params.last = event.target.lastName.value;
  		params.name = params.first + " " + params.last;
  		params.username = event.target.username.value;
  		params.email = event.target.email.value;
  		params.city = event.target.city.value;
  		params.lastModified = new Date();
  		params.infoEditing = false;
  		Meteor.call("editInfo", params, this._id, this.uid);
  		return false;
  	}
  });
  Template.userAbout.events({
  	"click #aboutEdit": function(){
  		Meteor.call("toggleAbout", this._id);
  	},
  	"submit .userAboutForm": function (event){
  		event.preventDefault();
  		var params = {};
  		params.about = event.target.about.value;
  		params.work = event.target.work.value;
  		params.education = event.target.education.value;
  		params.lastModified = new Date();
  		params.aboutEditing = false;
  		Meteor.call("editAbout", params, this._id, this.uid)
  		return false;
  	}
  });
  Accounts.ui.config({
	  passwordSignupFields: "USERNAME_ONLY"
	});
}

Meteor.methods({
	newProfile: function (params){
		if (!Meteor.userId()) throw new Meteor.Error("not-authorized");
		UserProfiles.insert(params);
	},
	editInfo: function (params, id, uid){
		if (Meteor.userId() != uid) throw new Meteor.Error("not-authorized");
		UserProfiles.update(id, {$set: params});
	},
	editAbout: function (params, id, uid){
		if (Meteor.userId() != uid) throw new Meteor.Error("not-authorized");
		UserProfiles.update(id, {$set: params});
	},
	toggleEdit: function(id){
		UserProfiles.update(id, {$set: { infoEditing: true }});
	},
	toggleAbout: function(id){
		UserProfiles.update(id, {$set: { aboutEditing: true }});
	},
	requestAdd: function(id){
		if (!Meteor.userId()) throw new Meteor.Error("not-authorized");
		var thisProfile = UserProfiles.find({ _id: id }).fetch();
		thisProfile[0].fRequests.push({ reqId: Meteor.userId(), reqUser: Meteor.user().username });
		UserProfiles.update(id, {$set: { fRequests: thisProfile[0].fRequests }});
	}
})

if (Meteor.isServer) {
  
	  Meteor.publish("profiles", function(user){
	  	if (!user) return UserProfiles.find({});
	  	else return UserProfiles.find({ username: user });
	  });
  
}
          