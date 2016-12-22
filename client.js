let perPage = Meteor.settings.public && Meteor.settings.public.navybitsPagination && Meteor.settings.public.navybitsPagination.perPage || undefined;
Template.navybitsPagination.events({
    'click .pagination-link': function (ev, temp) {
        let destination = +temp.$(ev.target).attr('data-page');
        temp.pageNum.set(destination);
    },
    'change #sortBy': function (ev, temp) {
        let sortBy = temp.$(ev.target).val(),
            sortingDirection = (sortBy === "date" || sortBy === "createdAt") ? "desc" : "asc";
        temp.sortBy.set({
            sortBy,
            sortingDirection
        });
    },
    'keyup #searchForDocument': function (ev, temp) {
        temp.searchingFor.set($(ev.target).val());
        console.log(temp.searchingFor.get());
    },
});
var updatePages = function (dataLength, perPage) {
    let totalPgs = parseInt(dataLength / perPage);
    if (dataLength % perPage !== 0) totalPgs += 1;
    return totalPgs;
}
var filterDataOnSearch = function (data, searchable, searchText) {
    return _.filter(data, (doc) => {
        let isMatchingSomeField = _.find(_.values(_.pick(doc, searchable)), (val) => {
            return val && _.isString(val) && val.match(searchText);
        });
        return isMatchingSomeField !== undefined;
    });
}
Template.navybitsPagination.helpers({
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
        let itemsPerPage = instance.perPage.get() || perPage; //how much items per page
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
    }

});
Template.navybitsPagination.rendered = function () {
    let self = Template.instance();
    let dataLength = self.data.data.length;
    let totalPgs = parseInt(dataLength / self.perPage.get());
    if (dataLength % self.perPage.get() !== 0) totalPgs += 1;
    self.totalPages.set(totalPgs);
}
Template.navybitsPagination.onCreated(function () {
    this.pageNum = new ReactiveVar(1);
    this.perPage = new ReactiveVar(5);
    this.totalPages = new ReactiveVar();
    this.sortBy = new ReactiveVar({
        sortBy: '',
        sortingDirection: ''
    });
    this.searchingFor = new ReactiveVar('');

    try {
        $('select').material_select();
    } catch (error) {
        console.log('Materialize is not supported!');
    }
});
Template.navybitsPagination.rendered = function () {
    try {
        $('select').material_select();
    } catch (error) {
        console.log('Materialize is not supported!');
    }
}