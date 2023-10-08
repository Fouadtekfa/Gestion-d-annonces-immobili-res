function getParams() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams;
}

function createImageInContainer( images, indexPhotoShow, announceHTML ) {
    img = images[ indexPhotoShow ];
    let ext = img.originalName.split( '.' )[1];
    let containerImage = $( '<div class="image-container-announce-body">');
    let btnLeftContainer = $('<div class="btn-direction-image-container"/>')
    let btnRightContainer = $('<div class="btn-direction-image-container"/>')
        
    let leftButton = $( '<i class="bx bx-chevrons-left directions"></i>');
    let rightButton = $( '<i class="bx bx-chevrons-right directions" ></i>');

    if( indexPhotoShow < images.length - 1 ){
        btnRightContainer.append(rightButton);
    }

    if( indexPhotoShow > 0 ) {
        btnLeftContainer.append(leftButton );
    }

    let imghtml = $( `<img class="image-announce" src="/images/uploads/${img.filename}.${ext}">`)
    containerImage.append( [ btnLeftContainer, imghtml, btnRightContainer ]);
    announceHTML.html( containerImage );
    setTimeout(() => {
        imghtml.css('opacity', 1);
    }, 700 )
    
    btnRightContainer.on( 'click', function() {
        if( indexPhotoShow < images.length - 1 ){
            indexPhotoShow++;
            imghtml.css('opacity', 0);
            setTimeout(() => {
                createImageInContainer( images, indexPhotoShow, announceHTML );
            }, 700);
        }
    } );

    btnLeftContainer.on( 'click', function() {
        if( indexPhotoShow > 0 ) {
            indexPhotoShow--;
            imghtml.css('opacity', 0);
            setTimeout(() => {
                createImageInContainer( images, indexPhotoShow, announceHTML );
            }, 700);
        }
    } );
}

function getUser( id ) {
    let usr;
    $.ajax({
        url : `/users/user/${id}`,
        type : 'GET',
        async:false,
        success : function( us ) {
            usr = us;
        },
        error : function(result, status, error) {
            console.error('Erreur: ' + error);
        },
    });
    return usr;
}