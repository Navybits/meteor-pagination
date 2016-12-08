let {
    public: {
        navybitsPagination: {
            perPage
        }
    }
} = Meteor.settings;
Template.navybitsPagination.events({
    'click .pagination-link': function (ev, temp) {
        let destination = +temp.$(ev.target).attr('data-page');
        temp.pageNum.set(destination);
    },
    'change #sortBy': function (ev, temp) {
        let sortBy = temp.$(ev.target).val(),
            sortingDirection = temp.$(ev.target).attr('data-sorting-direction');
        temp.sortBy.set({
            sortBy,
            sortingDirection
        });
    }
})
Template.navybitsPagination.helpers({
    page: function () {
        let pageNum = Template.instance().pageNum.get() || 1;
        let itemsPerPage = Template.instance().perPage.get() || perPage;
        let from = (pageNum - 1) * itemsPerPage;
        let to = from + itemsPerPage;
        let {
            data
        } = Template.instance().data;
        let {
            sortBy,
            sortingDirection
        } = Template.instance().sortBy.get();
        console.log({
            sortBy,
            sortingDirection
        });
        data = _.orderBy(data, [sortBy], [sortingDirection]);
        console.log({
            data
        });
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
        return Template.instance().totalPages.get();
    }

});
Template.navybitsPagination.onCreated(function () {
    this.pageNum = new ReactiveVar(1);
    this.perPage = new ReactiveVar(5);
    this.sortBy = new ReactiveVar({
        sortBy: 'date',
        sortingDirection: 'desc'
    });
    let dataLength = this.data.data.length;
    let totalPgs = parseInt(dataLength / this.perPage.get());
    if (dataLength % this.perPage.get() !== 0) totalPgs += 1;
    this.totalPages = new ReactiveVar(totalPgs);
    $('select').material_select();
});
Template.navybitsPagination.rendered = function () {
    $('select').material_select();
}