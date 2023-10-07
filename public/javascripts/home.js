$( document ).ready(function() {
    var image = document.querySelector('header .image'); // Sélectionnez votre image en fonction de son sélecteur
    image.style.opacity = '0.4';
    getAllAnnounces( createSectionAnnounces );
});

function getAllAnnounces( fn ) {
    $.ajax({
        url : '/announces/all',
        type : 'GET',
        success : function( res ) {
            fn( res );
        },
        error : function(result, status, error) {
            console.error('Erreur: ' + error);
        },
    });
}

function createSectionAnnounces( announces ) {
    announces = announces.filter( a => a.published );
    announces.forEach( announce => {
        console.log('create');
        let indexPhotoShow = 0;
        let container = $( '#announces-container' );
        
        let divContainer = $( `<div class="containerAnnounce"></div> `);
        let announceHTML = $('<div class="announce-image-container"/>');
        
        let title = $(`<div class="title-announce"><span>${announce.name} - ${announce.price}€</span></div>` );
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