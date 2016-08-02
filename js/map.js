var map;

var markers=[];

locations =  [
    {title: 'Empire State Building', location: {lat: 40.748441, lng: -73.985664}},
    {title: 'Statue of Liberty', location: {lat: 40.689249, lng: -74.044500}},
    {title: 'Central Park', location: {lat: 40.771133, lng: -73.974187}},
    {title: 'Times Square', location: {lat: 40.759011, lng: -73.984472}},
    {title: '9/11 Memorial', location: {lat: 40.711561, lng: -74.013174}},
    {title: 'MoMA', location: {lat: 40.712784, lng: -74.005941}}
    ];


// Create a new blank array for all the listing markers.
function initMap() {
  // Create a styles array to use with the map.
  var styles = [];
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 12,
    styles: styles,
    mapTypeControl: false
  });


  var defaultIcon = makeMarkerIcon('0091ff');
  var highlightedIcon = makeMarkerIcon('FFFF24');
  var largeInfowindow = new google.maps.InfoWindow();

  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    var position = locations[i].location;
    var title = locations[i].title;
    var marker = {};
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i
      });

    marker.title = title;
    marker.listvisible = ko.observable(true);
    marker.setMap(map);
    // Push the marker to our array of markers.
    markers.push(marker);
    // Create an onclick event to open the large infowindow at each marker.
    marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
    });

    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  }
  // define infowindow
  function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      // Clear the infowindow content to give the streetview time to load.
      infowindow.setContent('');
      infowindow.marker = marker;
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
      infowindow.open(map, marker);
      getFlickrImages();

          function getFlickrImages() {
           var flickrUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=ab2be4f78cbc26981e3fe484038ad122&sort=interestingness-desc&extras=url_s&format=json&text='+marker.title.replace(/\s/g,'');

           console.log(flickrUrl);
                  $.ajax({
                  url: flickrUrl,
                  dataType: 'jsonp',
                  jsonp: 'jsoncallback',
                  success: function(data) {
                      var photoUrl = data.photos.photo[1].url_s;
                      console.log(photoUrl);
                      infowindow.setContent('<h3>' + marker.title + '</h3><div id="pano"></div>');
                      $('#pano').append('<img src='+photoUrl+'>');
                  },
                  error: function() {
                    infowindow.setContent('<div>' + marker.title + '</div>' +
                      '<div>No Street View Found</div>');
                  }
              });
          }
    }
  }

  //   function getStreetView(data, status) {
  //           if (status == google.maps.StreetViewStatus.OK) {
  //             var nearStreetViewLocation = data.location.latLng;
  //             var heading = google.maps.geometry.spherical.computeHeading(
  //               nearStreetViewLocation, marker.position);
  //               infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
  //               var panoramaOptions = {
  //                 position: nearStreetViewLocation,
  //                 pov: {
  //                   heading: heading,
  //                   pitch: 30
  //                 }
  //               };
  //             var panorama = new google.maps.StreetViewPanorama(
  //               document.getElementById('pano'), panoramaOptions);
  //           } else {
  //             infowindow.setContent('<div>' + marker.title + '</div>' +
  //               '<div>No Street View Found</div>');
  //           }
  //         }
  // }

  function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
      }

  function viewModel () {
    var self = this;

    self.filterWord = ko.observable('');

    // computed obserable to update view when filterword change 
    self.filter = ko.computed(function() {
    var search = self.filterWord().toLowerCase();
    return ko.utils.arrayFilter(markers, function(marker) {
      if (marker.title.toLowerCase().indexOf(search) !== -1) {
            return marker.listvisible(true);
      } else {
            return marker.listvisible(false);
      }
      });
    });
    // when click, infowindow
    self.popup = function(data){
      populateInfoWindow(data, largeInfowindow);      
    }
  };

  ko.applyBindings(new viewModel);
}




