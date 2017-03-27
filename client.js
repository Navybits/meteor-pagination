var getVeryNestedPagination = function (item, level, result) {
    result = result || [];
    _.each(item, (value, key) => {
        let mylevel = level && "{0}.{1}".format(level, key) || key;
        if (!_.isObject(value) || _.isDate(value)) {
            result.push({
                key: mylevel,
                value
            });
        } else getVeryNestedPagination(value, mylevel, result);
    });
    return result;
}
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

    //sorting by descending date in case
    //no sorting options provided
    if (!self.data.sortingBy) {
        this.sortBy.set({
            sortBy: 'date',
            sortingDirection: 'desc'
        });
    }



    //searching capability
    this.searchingFor = new ReactiveVar('');

    /**
     * using external search query
     */
    this.autorun(() => {
        //getting the current external search word
        var dataContext = Template.currentData();
        let {
            externalSearchText
        } = dataContext;
        // console.log({externalSearchText,dataContext});
        if (externalSearchText && externalSearchText !== '') {
            let searchText = externalSearchText,
                limit = self.requiredPages.get();

            let {
                subscriptionDetails
            } = self.data
            //subscription name
            let subscriptionName = subscriptionDetails && subscriptionDetails.subscriptionName;

            //sending new request to the server 
            //with the new search text
            let query = {
                ...subscriptionDetails,
                limit
            };
            if (searchText) query.searchText = searchText;
            if (subscriptionName && limit && searchText)
                Meteor.subscribe(subscriptionName, query);

        }
        //setting the search reactive variable to the 
        //entered search text by the user
        self.searchingFor.set(externalSearchText);
    });
    /**----------using external search query------------ */


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

        let searchText = $(ev.target).val(),
            limit = temp.requiredPages.get();

        let {
            subscriptionDetails
        } = temp.data
        //subscription name
        let subscriptionName = subscriptionDetails && subscriptionDetails.subscriptionName;

        //sending new request to the server 
        //with the new search text
        let query = {
            ...subscriptionDetails,
            limit
        };
        if (searchText) query.searchText = searchText;
        if (subscriptionName && limit && searchText)
            Meteor.subscribe(subscriptionName, query);


        //setting the search reactive variable to the 
        //entered search text by the user
        temp.searchingFor.set(searchText);
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

        let {
            subscriptionDetails
        } = temp.data
        //subscription name
        let subscriptionName = subscriptionDetails && subscriptionDetails.subscriptionName;


        //next limit target
        let nextLimit = (temp.requiredPages.get() || 0) + temp.limitIncrease.get();

        //search text if exists
        let searchText = temp.searchingFor.get();

        //expand the subscription in case the 
        //subscriptionName is provided and 
        //we have the ability to expand
        if (temp.requiredPages.get() < currentCount + temp.limitIncrease.get() && subscriptionName) {
            let query = {
                ...subscriptionDetails,
                limit: nextLimit
            };
            if (searchText) query.searchText = searchText;
            Meteor.subscribe(subscriptionName, query);
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
        let isMatchingSomeField = _.find(_.map(_.values(getVeryNestedPagination(_.pick(doc, searchable))), (obj) => {
            return obj.value;
        }), (val) => {
            return val && _.isString(val) && val.toLowerCase().match(searchText.toLowerCase());
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
    isTable: function () {
        let instance = Template.instance(); //for easy use
        return instance.data && instance.data.isTable;
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