function Filter(config) {
    Filter.superclass.constructor.apply(this, arguments);
}

Filter.NAME = 'filter';
Filter.ATTRS = {
     /**
    * @description The selector for the elements that will trigger the filtering
    *
    * @attribute action_element
    * @default #filter
    * @type String
    */
    action_element: {
        value: '#filter',
        validator: Y.Lang.isString
    },
    
     /**
    * @description The event to listen for on the action_element to invoke the 
    * filtering 
    *
    * @attribute listen_action
    * @default click
    * @type String
    */
    listen_action: {
        value: 'click',
        validator: Y.Lang.isString
    },    
    
     /**
    * @description Contains the selector for all the elements that the filtering 
    * will be applied to.
    *
    * @attribute all_els
    * @default .all
    * @type String
    */
    all: {
        value: '.all',
        validator: Y.Lang.isString
    },
 
    /**
    * @description Contains the selector for nodes that should be displayed 
    * when the filter is selected
    *
    * @attribute show
    * @default .show
    * @type String
    */
    show: {
        value: '.show',
        validator: Y.Lang.isString
    },

    /**
    * @description Contains the css class to be applied to the clicked on filter
    * to show it's the active filter
    *
    * @attribute active_class
    * @default .current
    * @type String
    */
    active_class: {
        value: 'current',
        validator: Y.Lang.isString
    },

    /**
    * @description A selector to find the other related filters, this is mainly 
    * used for setting which filter is current
    *
    * @attribute filter_selector
    * @default .filter
    * @type String
    */
    filter_selector: {
        value: '.filter',
        validator: Y.Lang.isString
    },
    
    
    /**
    * @description The name of the event category that is fired when filtering
    *
    * @attribute event_category
    * @default filter
    * @type String
    */
    event_category: {
        value: 'filter',
        validator: Y.Lang.isString
    }
    
};

Y.extend(Filter, Y.Base, {
    initializer: function() {
        this._get_elements('action_element').on(this.get('listen_action'), function(e) {
            e.preventDefault();
            this.filter();
        }, this);
    },
    
    filter: function() {
        this.fire(this.get('event_category')+':start_filtering', {});
        this.hide();
        this.show();
        this.set_current_filter();
    },
    
    hide: function() {
        this._get_elements('all').setStyle('display', 'none');
        this.fire(this.get('event_category')+':hidden', {});
    },

    show: function() {
        this._get_elements('show').setStyle('display', 'block');
        this.fire(this.get('event_category')+':shown', {});
    },
    
    set_current_filter: function() {
        this._get_elements('filter_selector').removeClass(this.get('active_class'));
        this._get_elements('action_element').addClass(this.get('active_class'));
    },
    
    _get_elements: function(name) {
        return Y.all(this.get(name));
    }
});

Y.Filter = Filter;
