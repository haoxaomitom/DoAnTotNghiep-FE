let app = angular.module('parkingApp', []);

app.controller('ParkingController', ['$scope', '$http', 'ItemService', 'LocationService', 'PostService', function ($scope, $http, ItemService, LocationService, PostService) {
    $scope.posts = [];
    $scope.searchTerm = '';
    $scope.selectedDistrict = null; // Add selectedDistrict for tracking selected district
    $scope.currentPage = 0; // Start from the first page
    $scope.pageSize = 5; // Number of posts per page
    $scope.totalPagesCount = 0; // Total pages returned from the API
    $scope.loading = false;
    $scope.notFoundMessage = '';

    // Fetch posts with pagination
    $scope.getPosts = function () {
        $scope.loading = true;
        ItemService.getPosts($scope.currentPage, $scope.pageSize).then(function (response) {
            $scope.posts = response.data.content;
            $scope.totalPagesCount = response.data.totalPages;
            $scope.loading = false;
        }).catch(function (error) {
            $scope.loading = false;
            console.error('Error fetching posts:', error);
        });
    };

    // Go to the next page
    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.totalPagesCount - 1) {
            $scope.currentPage++;
            $scope.searchPosts();
        }
    };

    // Go to the previous page
    $scope.previousPage = function () {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
            $scope.searchPosts();
        }
    };

    // Fetch provinces and set default selections
    $scope.getProvinces = function () {
        LocationService.getProvinces().then(function (response) {
            $scope.provinces = response.data;

            // Set TP HCM
            $scope.selectedProvince = $scope.provinces.find(province => province.Name === "Thành phố Hồ Chí Minh");
            if ($scope.selectedProvince) {
                // Update districts when TP HCM is selected
                $scope.updateDistricts();
            }
        }).catch(function (error) {
            console.error('Error loading data:', error);
        });
    };

    $scope.updateDistricts = function () {
        if ($scope.selectedProvince) {
            $scope.districts = $scope.selectedProvince.Districts;
        } else {
            $scope.districts = []; // No province selected
        }
    };

    // Search posts based on search term and selected district
    $scope.searchPosts = function () {
        PostService.searchPosts($scope.searchTerm, $scope.selectedDistrict ? $scope.selectedDistrict.Name : null, $scope.currentPage)
            .then(function (response) {
                const posts = response.data.content || []; // Get the content from the response

                // Check if posts array is empty
                if (posts.length === 0) {
                    $scope.notFoundMessage = 'Không tìm thấy kết quả nào'; // Set not found message
                    $scope.posts = []; // Clear posts if no data found
                } else {
                    $scope.notFoundMessage = ''; // Clear the not found message if results are found
                    $scope.posts = posts; // Update posts list with search results
                    $scope.totalPagesCount = response.data.totalPages; // Update total pages
                }
            })
            .catch(function (error) {
                console.error('Error fetching posts:', error);
                $scope.notFoundMessage = 'Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại.'; // Set an error message
                $scope.posts = []; // Clear posts on error
            });
    };

    // Load the count of posts by district  
    $scope.loadDistrictPostCounts = function () {
        PostService.getPostsCountByDistrict().then(function (response) {
            $scope.districtPostCounts = response.data;
        }).catch(function (error) {
            console.error('Error loading district post counts:', error);
        });
    };

    $scope.onDistrictChange = function () {
        if ($scope.selectedDistrict && $scope.selectedDistrict.Name) {
            PostService.searchPosts($scope.selectedDistrict.Name, $scope.currentPage)
                .then(function (response) {
                    const posts = response.data.content || [];
                    if (posts.length === 0) {
                        $scope.notFoundMessage = 'Không tìm thấy kết quả nào';
                        $scope.posts = [];
                    } else {
                        $scope.notFoundMessage = '';  // Clear message if there are results
                        $scope.posts = posts;
                    }
                    $scope.totalPagesCount = response.data.totalPages;
                })
                .catch(function (error) {
                    console.error('Error fetching posts:', error);
                });
        } else {
            $scope.notFoundMessage = '';
            $scope.getPosts();
        }
    };


    $scope.searchPostsByVehicleType = function () {
        if ($scope.selectedVehicleType) {
            PostService.searchPostsByVehicleType($scope.selectedVehicleType, $scope.currentPage)
                .then(function (response) {
                    const posts = response.data.content || [];
                    if (posts.length === 0) {
                        $scope.notFoundMessage = 'Không tìm thấy kết quả nào';  // Set message if no results
                        $scope.posts = [];
                    } else {
                        $scope.notFoundMessage = '';  // Clear message if there are results
                        $scope.posts = posts;
                    }
                    $scope.totalPagesCount = response.data.totalPages;
                })
                .catch(function (error) {
                    console.error('Error fetching posts:', error);
                });
        } else {
            $scope.notFoundMessage = '';
            $scope.getPosts();
        }
    };


    // Format time function
    $scope.formatTimeAgo = function (date) {
        let now = new Date();
        let createdAt = new Date(date);
        let timeDiff = Math.floor((now - createdAt) / 1000);

        if (isNaN(timeDiff)) return "Invalid time";

        if (timeDiff < 60) return timeDiff + " giây trước";
        if (timeDiff < 3600) return Math.floor(timeDiff / 60) + " phút trước";
        if (timeDiff < 86400) return Math.floor(timeDiff / 3600) + " giờ trước";
        return Math.floor(timeDiff / 86400) + " ngày trước";
    };

    $scope.getPosts();
    $scope.getProvinces();
    $scope.loadDistrictPostCounts();
}]);
