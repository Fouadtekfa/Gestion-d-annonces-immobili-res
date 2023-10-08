_filters = {
    public: true,
    noPublic: false,
}

$( document ).ready(function() {
    var image = document.querySelector('header .image'); // Sélectionnez votre image en fonction de son sélecteur
    image.style.opacity = '0.4';
    getAllAnnounces( createSectionAnnounces );

    $('#all').on( 'click', () => {
        _filters.public = true;
        _filters.noPublic = true;
        getAllAnnounces( createSectionAnnounces );
    });

    $('#public').on( 'click', () => {
        _filters.public = true;
        _filters.noPublic = false;
        getAllAnnounces( createSectionAnnounces);
    });

    $('#noPublic').on( 'click', () => {
        _filters.public = false;
        _filters.noPublic = true;
        getAllAnnounces( createSectionAnnounces );
    });
});

function getAllAnnounces( fn, published ) {
    $.ajax({
        url : '/announces/all',
        type : 'GET',
        success : function( res ) {
            fn( res, published );
        },
        error : function(result, status, error) {
            console.error('Erreur: ' + error);
        },
    });
}

function createSectionAnnounces( announces ) {
    $('#announces-container').html('');
    if( _filters.public && !_filters.noPublic ) {
        announces = announces.filter( a => a.published == _filters.public );
    } else if( _filters.noPublic && !_filters.public ) {console.log('no public');
        announces = announces.filter( a => !a.published );
    }


    announces.forEach( announce => {
        let indexPhotoShow = 0;
        let container = $( '#announces-container' );
        
        let divContainer = $( `<div class="containerAnnounce"></div> `);
        let announceHTML = $('<div class="announce-image-container"/>');
        let spanPencil = admin ? $( '<span class="pencil-edit"><i class="bx bxs-edit-alt"></i></span>' ) : $( '<span></span>' ) ;
        let title = $(`<div class="title-announce"><span style="width: 100%;">${announce.name} - ${announce.price}€</div>` );
        title.append( spanPencil );

        $( spanPencil ).on( 'click', function() {
            window.location.href = `/announces/create?id=${announce._id}`;
        } );

        divContainer.append(title);
        
        let images = announce.photos;
        if( images.length > 0 ) {
            createImageInContainer( images, indexPhotoShow, announceHTML );
        } else {
            let images = [ { filename: 'no-image', originalName: 'no-image.jpg' } ];
            createImageInContainer( images, 0, announceHTML );
        }
        
        // Details
        let detailsContainer = $( '<div class="details-container"/>' );
        detailsContainer.append(`<span class="label-details">Disponible à partir de: </span><span>${new Date( announce.date ).toLocaleDateString('fr-FR') }</span>` )
        detailsContainer.append(`<br><br><span class="label-details">Type d'annonce: </span><span>${announce.type}</span>` );
        detailsContainer.append(`<br><br><span class="label-details">Status: </span><span>${announce.status}</span>` );
        detailsContainer.append(`<br><br><span class="label-details">Description: </span><span>${announce.description}</span>` );
        if( admin ) {
            detailsContainer.append(`<br><br><span class="label-details">Publié: </span><span>${announce.published ? 'Oui' : 'Non'}</span>` );
        }
        
        divContainer.append(announceHTML);
        divContainer.append( detailsContainer );
        container.append(divContainer);
        
        
    });
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

    let imghtml = $( `<img class="image-announce" src="../images/uploads/${img.filename}.${ext}">`)
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