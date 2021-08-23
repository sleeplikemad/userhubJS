const BASE_URL = 'https://jsonplace-univclone.herokuapp.com';

function fetchUsers() {
    return fetchData(BASE_URL + "/users");
}

function renderUser(user) {
    let userCard = $('<div>');
    userCard.addClass('user-card');

    let header = $('<header>')
    let head = $('<h2>' + user.name + '</h2>')
    header.append(head)

    let companyInfo = $('<section>')
    companyInfo.addClass('company-info')
    let contact = $('<p><b>Contact: </b>' + user.email + '</p>')
    let worksFor = $('<p><b>Works for: </b>' + user.company.name + '</p>')
    let companyCreed = $('<p><b>Company creed: </b>"' + user.company.catchPhrase + user.company.bs + '!"</p>')
    companyInfo.append(contact).append(worksFor).append(companyCreed)

    let footer = $('<footer>')
    let posts = $('<button>POSTS BY ' + user.username + '</button>')
    posts.addClass('load-posts')
    let albums = $('<button>ALBUMS BY ' + user.username + '</button>')
    albums.addClass('load-albums')
    footer.append(posts).append(albums)

    userCard.append(header).append(companyInfo).append(footer)
    userCard.data('user', user)
    return userCard;
}

function renderUserList(userList) {
    $('#user-list').empty();

    userList.forEach(function(user) {
        $('#user-list').append(renderUser(user))
    })
}

function fetchUserAlbumList(userId) {
    return fetchData(BASE_URL + '/users/' + userId + '/albums' + '?_expand=user&_embed=photos');
}

function renderAlbum(album) {
    let albumCard = $('<div>')
    albumCard.addClass('album-card')
    let header = $('<header>')
    let h3 = $('<h3>' + album.title + '</h3>')
    let section = $('<section>')
    section.addClass('photo-list')
    album.photos.forEach(function(e) {
        $('.photo-list').append(renderPhoto(e));
    })
    header.append(h3)
    albumCard.append(header).append(section)
    return albumCard;
}

function renderPhoto(photo) {
    let photoCard = $('<div>')
    photoCard.addClass('photo-card')
    let link = $('<a>')
    link.attr('href', photo.url).attr('target', '_blank')
    let image = $('<img>')
    image.attr('src', photo.thumbnailUrl)
    let title = $("<figure>" + photo.title + '</figure>')
    link.append(image).append(title)
    photoCard.append(link)
    return photoCard;
}

function renderAlbumList(albumList) {
    $('#app section.active').removeClass('active')
    $('#album-list').addClass('active').empty()
    albumList.forEach(function(e) {
        $('#album-list').append(renderAlbum(e));
    })
}

function fetchData(url) {
    return fetch(url).then(function(res) {
        return res.json()
    }).catch(function(error) {
        console.log(error)
    })
}

function bootstrap() {
    fetchUsers().then(renderUserList).catch(function(error) {
        console.log(error)
    });
}

function fetchUserPosts(userId) {
    return fetchData(BASE_URL + '/users/' + userId + '/posts?_expand=user');
}
  
function fetchPostComments(postId) {
    return fetchData(BASE_URL + '/posts/' + postId + '/comments');
}

function setCommentsOnPost(post) {
    if (post.comments) {
        return Promise.reject()
    }

    return fetchPostComments(post.id)
            .then(function (comments) {
                post.comments = comments
                return post;
    });
}

function renderPost(post) {
    let postCard = $('<div>')
    postCard.addClass('post-card')
    let header = $('<header>')
    let firstH = $('<h3>' + post.title + '</h3>')
    let secondH = $('<h3>' + post.user.username + '</h3>')
    let body = $('<p>' + post.body + '</p>')
    let footer = $('<footer>')
    let commentList = $('<div>')
    commentList.addClass('comment-list')
    let link = $('<a>(<span class="verb">show</span> comments)</a>')
    link.attr('href', '#').addClass('toggle-comments')

    footer.append(commentList).append(link)
    header.append(firstH).append(secondH)
    postCard.append(header).append(body).append(footer)
    return postCard.data('post', post)
}

function renderPostList(postList) {
    $('#app section.active').removeClass('active');
    $('#post-list').addClass('active').empty();
    postList.forEach(function (e) {
        $('#post-list').append(renderPost(e));
    });
}

function toggleComments(postCardElement) {
    const footerElement = postCardElement.find('footer');
  
    if (footerElement.hasClass('comments-open')) {
      footerElement.removeClass('comments-open');
      footerElement.find('.verb').text('show');
    } else {
      footerElement.addClass('comments-open');
      footerElement.find('.verb').text('hide');
    }
}

$('#user-list').on('click', '.user-card .load-posts', function () {
    const user = $(this).closest('.user-card').data('user');
    fetchUserPosts(user.id).then(renderPostList);
});
  
$('#user-list').on('click', '.user-card .load-albums', function () {
    const user = $(this).closest('.user-card').data('user');
    fetchUserAlbumList(user.id).then(renderAlbumList); 
});

$('#post-list').on('click', '.post-card .toggle-comments', function () {
    const postCardElement = $(this).closest('.post-card');
    const post = postCardElement.data('post');
    const commentList = postCardElement.find('.comment-list');

    setCommentsOnPost(post).then(function (post) {
        commentList.empty();
        post.comments.forEach(function(e){
            commentList.prepend($('<h3>' + e.body + '--- ' + e.email + '</h3>'));
        });

        toggleComments(postCardElement);
    }).catch(function () {
        toggleComments(postCardElement);
    });
});


bootstrap()