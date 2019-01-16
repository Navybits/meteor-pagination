# navybits:pagination
___
### Demo 
[Pagination demo](https://meteor.navybits.com/comments)

### Description
**navybits:pagination** is a simple pagination package cooked for use in meteor apps.  
This package provides two major advantages upon other pagination packages:
 1. Server independency: It does not include code that need to be run on server side. It's your data, and you know what data you want to paginate!
 2. **Flexibility**: The package is flexible by mentality, it supports each kind of the following situations :
   - Pagination of a *set of documents* from existing data collection through subscription. A good example is the pagination of all feedbacks (*data collection*) sent by users in an efficient way (Think about **10,000** feedbacks during 2 years of service) .
   - Pagination of an *array field* in all documents in a collection. For example pagination of all comments(*array field*) for all posts (*collection*) (Think about **100** comments for each of **10,000** posts in your system, imagine these comments are distributed upon 5 years of service).
   - Pagination of a *set of data* that exists on client side. This happens in case you already have a set of data and you want to enhance the user experience.

### Dependencies
  - tap:i18n@1.8.2
  - stevezhu:lodash@4.15.0
  - jquery@1.11.9
  - reactive-var@1.0.10
 
### Installation:
```sh
meteor add navybits:pagination
```
### Use

## Usage with blaze:

For instance, we will cover the 3rd use case of data pagination where you already have your data and you want to enhance the user experience:
in your `temp.js` file
```javascript
//We will use a helper
//which is handling the data
//to be paginated
Template.temp.helpers({
 dataToPaginate:function(){
    //return your data as an array of objects
    return [{name:"taha",age:25},{name:"Mohammad",age:31}];
 }
});
```
Then in your `temp.html` file
```
{{#navybitsPagination data=dataToPaginate}}
    <div>Name : {{name}} , age :{{age}}</div><br/> 
{{/navybitsPagination}}
```
> Congratulations! This way you will have the 2 array elements paginated. Pretty cool not ?!
This is just a demo, obviously you have to fill the `dataToPaginate` helper by you own data set 

## Usage with React:
When using React, it is possible to render blaze templates:
First, let's say you have the following blaze template `pagination.html`:
```
<template name="pagination">
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Age</th>
            </tr>
        </thead>
        {{#navybitsPagination data=dataToPaginate isTable=true}}
        <tr>
            <td>{{name}}</td>
            <td>{{age}}</td>
        </tr>
        {{/navybitsPagination}}
    </table>
</template>
```
Now you have the blaze template using `navybits:pagination` ready, all you need is a way to let React renders this template. For this purpose, you can use `gadicc:blaze-react-component` package:
Let's create a wrapper component for your pagination template, for example `paginationBlazeWrapper.js`:
```
import React, { Component } from 'react';
import Blaze from 'meteor/gadicc:blaze-react-component';
export default class NavybitsPagination extends Component {
    render() {
        return <div>
            <Blaze template="pagination"
                dataToPaginate={this.props.data}
            />
        </div>
    }
}
```
That's is, now you have your `NavybitsPagination` component ready to reuse as much as needed, let's say in some other component:
```
import NavybitsPagination from './paginationBlazeWrapper';//choose the right path for your file 'paginationBlazeWrapper.js'
....
....
....
render(){
return (
...
         <NavybitsPagination
            data={[{name:"taha",age:25},{name:"Mohammad",age:31}]}
          />
....
)

```

> Congratulations! That's it

For more details about using the package in different situations, please visit our blog post page  :  
[Visit our blog](https://blog.navybits.com/efficient-and-high-performance-pagination-in-meteor-bb5d379d234)

### Version
1.0.0

### License

MIT
