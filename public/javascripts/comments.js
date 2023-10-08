var _announce;

$( document ).ready(function() {
    if( announceId ) { 
        $.ajax({
            url : `/announces/announce/${announceId}`,
            type : 'GET',
            success : function( res ) {
                _announce = res;
                createImageForAnnounce();
                createCommentsSection();
            },
            error : function(result, status, error) {
                console.error('Erreur: ' + error);
            },
        });
    }
});

function createImageForAnnounce() {
    let container = $( '#announces-container' );
    let divContainer = $( `<div class="containerAnnounce"></div> `);
    let announceHTML = $('<div class="announce-image-container"/>');
    divContainer.append(announceHTML);
    let images = _announce.photos;

    if( images.length > 0 ) {
        createImageInContainer( images, 0, announceHTML );
    } else {
        let images = [ { filename: 'no-image', originalName: 'no-image.jpg' } ];
        createImageInContainer( images, 0, announceHTML );
    }


    let detailsContainer = $( '<div class="details-container"/>' );
        detailsContainer.append(`<span class="label-details">Disponible à partir de: </span><span>${new Date( _announce.date ).toLocaleDateString('fr-FR') }</span>` )
        detailsContainer.append(`<br><br><span class="label-details">Type d'annonce: </span><span>${_announce.type}</span>` );
        detailsContainer.append(`<br><br><span class="label-details">Status: </span><span>${_announce.status}</span>` );
        detailsContainer.append(`<br><br><span class="label-details">Description: </span><span>${_announce.description}</span>` );
    divContainer.append( detailsContainer );
    container.append(divContainer);
}

function createCommentsSection() {
    let container = $('#container-comments-content');
    if ( _announce.comments.length > 0 ) {
        _announce.comments.forEach( c => {
            let commentContainer = $('<div class="comment-principal-container"/>');
            c.history.forEach( ( h, idx ) => {
                let us = getUser( h.id_user);

                let btnResponse = $( '<a class="btn-response"></a>' );
                if( idx == 0 ) {
                    if( admin && !us.isAdmin || ( idx == 0 && us._id == userId ) ) {
                        btnResponse.html('Repondre')
                    }
                }
                let adminTxt = us.isAdmin ? '(Admin)' : '';
                let classResponse = idx > 0 ? 'response-comment' : '';
                let content = $(`<div class="comment-content ${classResponse}">
                        <p class="card-subtitle mb-2 text-muted">${us.first_name} ${us.name} ${adminTxt}: ${h.content}</p>
                        <p class="card-subtitle mb-2 text-muted">Date: ${moment(h.date).format('DD/MM/YYYY')}</p>
                        </div>
                        `);

                
                content.append(btnResponse);
                commentContainer.append(content);

                $( btnResponse ).on( 'click', function() {
                    $(commentContainer).find('.text-area-response-container').remove();
                    let containerResponse = $('<div class="text-area-response-container">');
                    let textArea = $('<textarea class="comment-text-area"/>')
                    let btnSend = $('<button class="btn btn-primary">Envoyer</button>');
                    
                    $(containerResponse).append( [ textArea, btnSend ] );
                    commentContainer.append( containerResponse );

                    $( btnSend ).on( 'click', function() {
                        let nexValue = textArea.val();

                        c.history.push({
                            id_user: userId,
                            content: nexValue,
                            date: new Date(),
                            read: false
                        });

                        $.ajax({
                            url : `/announce/${_announce._id}/commentaire/history`,
                            type : 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify( _announce.comments ),
                            processData: false,
                            success : function(result, status, error) {
                                location.reload();
                            },
                            error : function(result, status, error) {
                                console.error('Erreur: ' + error);
                            },
                        });

                    } );
                } );
            });

            $(container).append(commentContainer);
        })

    } else {
        container.html('<div class="no-comments"><h3>No commentaires</h3></div>')
    }
}