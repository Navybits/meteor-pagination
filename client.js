Template.navybitsPagination.onCreated(function () {
    //using self instead of this
    let self = this;

    //how much we are requiring data on first load
    this.requiredPages = new ReactiveVar(Number(self.data.initialRequiredPages) || 10);

    //how much we are increasing the limit each time
    this.limitIncrease = new ReactiveVar(Number(self.data.limitIncrease) || 10);

    //subscribe to the initial amount of data
    let subscriptionDetails = self.data.subscriptionDetails;
    let subscriptionName = subscriptionDetails && subscriptionDetails.subscriptionName;
    if (subscriptionName) {
        Meteor.subscribe(subscriptionName, {
            ...subscriptionDetails,
            limit: this.requiredPages.get()
        });
    }
    //setting the pageNum to the first page initially 
    this.pageNum = new ReactiveVar(1);

    //setting the amount of data we want to render in each page
    this.perPage = new ReactiveVar(Number(self.data.perPage) || 5);

    //the number of total pages , to be calculated dynamically
    this.totalPages = new ReactiveVar();

    //sorting capabilitites
    this.sortBy = new ReactiveVar({
        sortBy: '',
        sortingDirection: ''
    });
    //searching capability
    this.searchingFor = new ReactiveVar('');

    //checking if the project has materialize
    try {
        $('select').material_select();
    } catch (error) {
        console.log('Materialize is not supported!');
    }
});

Template.navybitsPagination.events({
    'click .pagination-link': function (ev, temp) {
        //set the page to the selected page number 
        let destination = +temp.$(ev.target).attr('data-page');
        temp.pageNum.set(destination);
    },
    'change #sortBy': function (ev, temp) {
        //set the sorting reactive object to the selected sorting option
        let sortBy = temp.$(ev.target).val(),
            //default sorting direction is ascending, unless in case of date or createdAt sorting
            //this is because we are assuming that we are almost always interested about the newest
            //result if we want to sort by date
            sortingDirection = (sortBy === "date" || sortBy === "createdAt") ? "desc" : "asc";
        temp.sortBy.set({
            sortBy,
            sortingDirection
        });
    },
    'keyup #searchForDocument': function (ev, temp) {
        //setting the search reactive variable to the 
        //entered search text by the user
        temp.searchingFor.set($(ev.target).val());
    },
    'click .navybits-more-pages': function (ev, temp) {
        /**
         * this event is very important
         * the pagination performance 
         * quality indicator is here 
         * the following code takes care of 
         * the expantion of subscription result 
         * in case the user is providing a subscription name
         */

        // current length of the data   
        let dataLength = temp.data.data.length;
        let currentCount = dataLength || 0;

        //subscription name
        let subscriptionName = temp.data.subscriptionDetails && temp.data.subscriptionDetails.subscriptionName;


        //next limit target
        let nextLimit = (temp.requiredPages.get() || 0) + temp.limitIncrease.get();

        //expand the subscription in case the 
        //subscriptionName is provided and 
        //we have the ability to expand
        if (temp.requiredPages.get() < currentCount + temp.limitIncrease.get() && subscriptionName) {
            Meteor.subscribe(subscriptionName, {
                limit: nextLimit
            });
        }

        //setting the new required data limit
        temp.requiredPages.set(nextLimit);
    }
});
var updatePages = function (dataLength, perPage) {
    //this function is responsible for 
    //updating the totalPages variable 
    //based on the data length
    let totalPgs = parseInt(dataLength / perPage);
    if (dataLength % perPage !== 0) totalPgs += 1;
    return totalPgs;
}
var filterDataOnSearch = function (data, searchable, searchText) {
    //this function searches only into
    //the searchable fields of all data
    return _.filter(data, (doc) => {
        let isMatchingSomeField = _.find(_.values(_.pick(doc, searchable)), (val) => {
            return val && _.isString(val) && val.match(searchText);
        });
        return isMatchingSomeField !== undefined;
    });
}
Template.navybitsPagination.helpers({
    //a helper for materialize components
    //we test it when we want to use
    //a materialize component in our templates
    isMaterialized: function () {
        let result = false;
        try {
            if (Materialize !== undefined) result = true;
        } catch (ex) {
            console.log('not defined');
            result = false
        }
        return result;
    },
    isEmpty: function (obj) {
        return _.isEmpty(obj);
    },
    page: function () {
        let instance = Template.instance(); //for easy use
        let pageNum = instance.pageNum.get() || 1; //getting page number
        let itemsPerPage = instance.perPage.get(); //how much items per page
        //calculation of indexes from and to
        let from = (pageNum - 1) * itemsPerPage;
        let to = from + itemsPerPage;

        //getting data sent to the pagination template
        let {
            data,
            searchable
        } = instance.data;

        //getting the current status for sorting
        let {
            sortBy,
            sortingDirection
        } = instance.sortBy.get();

        //getting the current status of search text
        let searchText = instance.searchingFor.get();

        //in case we are searching for something 
        //filter data based on search text
        if (!_.isEmpty(searchable) && searchText !== '') {
            data = filterDataOnSearch(data, searchable, searchText)
        }

        //sort data based on sorting info
        data = _.orderBy(data, [sortBy], [sortingDirection]);

        //update pages navigatoe
        let dataLength = data.length,
            perPage = instance.perPage.get();
        instance.totalPages.set(updatePages(dataLength, perPage));

        //return the result
        return _.slice(data, from, to);
    },
    minusOne: function (num) {
        return num - 1;
    },
    plusOne: function (num) {
        return num + 1;
    },
    isAscOrder: function (num1, num2) {
        return num1 < num2;
    },
    isDescOrder: function (num1, num2) {
        return num1 > num2;
    },
    currentPage: function () {
        return Template.instance().pageNum.get();
    },
    totalPages: function () {
        let instance = Template.instance();
        return instance.totalPages.get();
    },
    totalRecords: function () {
        // current length of the data   
        let instance = Template.instance();
        let dataLength = instance && instance.data && instance.data.data && instance.data.data.length || 0;
        return dataLength;
    },
    requiredPages: function () {
        let instance = Template.instance();
        return instance.requiredPages.get() - instance.limitIncrease.get();
    },
    subscriptionName: function () {
        let instance = Template.instance();
        let subscriptionDetails = instance.data.subscriptionDetails;
        return subscriptionDetails && subscriptionDetails.subscriptionName;
    }

});
Template.navybitsPagination.rendered = function () {
    let self = Template.instance();
    let dataLength = self.data.data.length;
    //calculation of the total number of pages for the first time
    let totalPgs = updatePages(dataLength, self.perPage.get());
    self.totalPages.set(totalPgs);
    //checking if the project has materialize 
    try {
        $('select').material_select();
    } catch (error) {
        console.log('Materialize is not supported!');
    }
}