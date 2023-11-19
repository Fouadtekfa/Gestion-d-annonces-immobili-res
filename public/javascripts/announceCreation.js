var generateId = () => { return Date.now().toString(24) + Math.random().toString( 24).substring( 2 ); };
let dropedImages = [];
let imagesToDelete = [];
let _announce;

$( document ).ready(function() {
    // Checking params
    $( '.container-image' ).css( { opacity: '0.4' } );
    $( '.container-form' ).css( { 'margin': '0 0 0 50px', opacity: '1' } );
    let id = getParams().get('id');
    if( id ) {
        // Modify Page
        // Get the announce
        $.ajax({
            url : `/announces/announce/${id}`,
            type : 'GET',
            success : function( res ) {
                fillAnnounceData( res );
                _announce = res;
                createNewPhoto();
                // Create a delete button
                let btnDelete = $( '<button class="btn btn-danger" type="submit" style="margin-right: 20px">Supprimer</button>' );
                $('.footer-form').prepend( btnDelete );
        
                $( btnDelete ).on( 'click', function( e ) {
                    e.preventDefault();
                    deleteAnnounce( _announce );
                } );
            },
            error : function(result, status, error) {
                console.error('Erreur: ' + error);
            },
        });
        $ ( '#form-create-announce' ).on( 'submit', function( e ) {
            e.preventDefault();
            submitHandler( this, modifyAnnounceHandler );
        } );


    } else {
        // Create Page
        $ ( '#form-create-announce' ).on( 'submit', function( e ) {
            e.preventDefault();
            submitHandler( this, createAnnounceHandler );
        } );
        createNewPhoto();
    }
    
});

function deleteAnnounce( announce ) {
    if( announce.photos.length > 0 ) {
        announce.photos.forEach( p => {
            let ext = p.originalName.split('.')[ 1 ];
            imagesToDelete.push(`${p.filename}.${ext}`);
        });

        const query = $.param( { files: imagesToDelete } );

        $.ajax({
            url : `/deleteFile?${query}`,
            type : 'DELETE',            
            processData: false,
            contentType: false,
            success : function(result, status, error) {
                next();
            },
            error : function(result, status, error) {
                console.error('Erreur dans la suppression : ' + error);
            },
        });
    } else {
        next();
    }

    function next() {
        $.ajax({
            url : `/announces/announce/${announce._id}`,
            type : 'DELETE',            
            processData: false,
            contentType: false,
            success : function(result, status, error) {
                window.location.href = '/';
            },
            error : function(result, status, error) {
                console.error('Erreur dans la suppression : ' + error);
            },
        });
    }
}

/**
 * Create a new photo element in the form section
 */
function createNewPhoto( p ) {
    let container_elements = $('<div class="container-elements"/>');
    let divContainer = $( `<div class="containerPhoto"><div><i class='bx bxs-camera camera-icon'>+</i></div></div> `);
    container_elements.append( divContainer );
    let id = generateId();
    let input = $(`<input name="image" id="${id}" class="createImage" type="file" accept="image/png, image/gif, image/jpeg, image/jpg" style="display: none">` );

    $( container_elements ).append( input );
    $('.photos-container').append( container_elements );

    if( p ) {
        input.removeClass('createImage');
        let ext = p.originalName.split('.')[ 1 ];
        chargeimage( null, divContainer, container_elements, `/images/uploads/${p.filename}.${ext}`, true );
    }

    $( divContainer ).on( 'click', () => {
        $( input ).trigger( 'click' );
    } );

    $( input ).on( 'change', ( e ) => {
        let $this = e.currentTarget;
        let files = $this.files[0];
        chargeimage( files, divContainer, container_elements );
        createNewPhoto();
    } );

    container_elements.on('dragover', function( e ) {
        e.preventDefault();
        $( divContainer ).css( { 'border': '1px solid black', 'opacity': '1' } );
    });

    container_elements.on('dragleave', function( e ) {
        e.preventDefault();
        $( divContainer ).css( { 'border': '2px dashed rgb(27, 27, 27)', 'opacity': '0.4' } );
    });

    container_elements.on('drop', async( e ) => {
        e.stopPropagation();
        e.preventDefault();

        const filesArray = [ ...e.originalEvent.dataTransfer.files]    
        
        const f = await new Promise(( resolve ) => {
            let fr = new FileReader();
            fr.onload = () => { resolve(true) }
            
            fr.onerror = () => {  resolve(false)  }
            fr.readAsArrayBuffer( e.originalEvent.dataTransfer.files[ 0 ] )
        });
        
        if( !f ) {
            console.log('not a file');
        }

        input.removeClass( 'createImage' );

            dropedImages.push( {
                id: id,
                file:   filesArray[ 0 ]
            } );
        upload( filesArray[0], divContainer, container_elements);    

    });
}

/**
 * Upload the image when drop in the content final process to generate the file reader
 * @param {File} file 
 * @param {*} divContainer 
 * @param {*} container_elements 
 */
function upload( file, divContainer, container_elements) {
    let fr = new FileReader();
    
    fr.onload = () => {
        chargeimage( null, divContainer, container_elements, fr.result );
        createNewPhoto();
    }

    fr.readAsDataURL(file);
}

/**
 * Show previsualisation image
 * @param {File} file 
 * @param {*} divContainer 
 * @param {*} container_elements 
 * @param {*} src 
 */
function chargeimage( file, divContainer, container_elements, url, loading ) {
    let src = url ? url : URL.createObjectURL(file)
    let img = $( `<img src="${src}" style="width:100%; height:100%">`);
    let $trash = $( '<i class="bx bx-trash trash-icon"></i>');
    divContainer.html( img );
    container_elements.append( $trash )
    $( divContainer ).css( { 'border': '1px solid black', 'opacity': '1' } );

    $( $trash ).on('click', function() {
        let input = $( this ).closest( '.container-elements' ).find( 'input' );
        let indexFileInDrop = dropedImages.map( i => i.id ).indexOf($( input ).attr('id') );
        if( indexFileInDrop >= 0 ) {
            dropedImages.splice( indexFileInDrop, 1 );
        }
        $( container_elements ).remove();

        if( loading ) {
            let name = url.split( '/' );
            name = name[ name.length - 1 ];
            imagesToDelete.push( name );
            _announce.photos = _announce.photos.filter( p => p.filename != name.split( '.' )[ 0 ] );
        }

    } );
}


function submitHandler( e, fn ) {
    // Enregistrae les images
    const form = $('#form-create-announce')[0];
    const formData = new FormData(form);
    
    // Sauvegardes les objets des images pour la base de donnees
    let fileNamesToSave = [];

    // Recuperer les inputs des images
    const inputs = form.querySelectorAll('.createImage');
    formData.delete('image');   
    inputs.forEach((input, index) => {
        const file = input.files[0];
        if (file) {
            let fileObj = {
                filename: $( input ).attr( 'id' ),
                originalName: file.name
            };
            fileNamesToSave.push( fileObj );
            let ext = file.name.split('.').pop();
            const newName = `${fileObj.filename}.${ext}`;
            formData.append('image', file, newName);   
        }
    });

    
    dropedImages.forEach( img => {
        let file = img.file;

        let fileObj = {
            filename: generateId(),
             originalName: file.name
        };
        fileNamesToSave.push( fileObj );
        let ext = file.name.split('.').pop();
        const newName = `${fileObj.filename}.${ext}`;
        formData.append('image', file, newName);   
    } );

    if( fileNamesToSave.length > 0 ) {
        // Savegarder les images dans le servur
        $.ajax({
            url : '/upload',
            type : 'POST',
            data : formData,
            processData: false,
            contentType: false,
            success : function(result, status, error) {
                fn( fileNamesToSave );
            },
            error : function(result, status, error) {
                console.error('Error al guardar la imagen');
            },
        });
    } else {
        fn( fileNamesToSave );
    }

    
}

function createAnnounceHandler( fileNamesToSave ) {    
    let dataToSend = { 
        name: $( '#name-announce' ).val(),
        type: $( '#type-announce' ).val(),
        published: $( '#publish-announce' ).is( ':checked' ),
        status: $( '#status-announce' ).val(),
        description: $( '#description-announce').val(),
        price: $( '#price-anounce' ).val(),
        date: $( '#date-announce' ).val(),
        photos: fileNamesToSave
    }
    $.ajax({
        url : '/announces/create',
        type : 'POST',
        contentType: 'application/json',
        data: JSON.stringify( dataToSend ),
        processData: false,
        success : function(result, status, error) {
            window.location='/';
            
        },
        error : function(result, status, error) {
            console.error('Erreur: ' + error);
        },
    });
}

function modifyAnnounceHandler( fileNamesToSave ) {
    if(imagesToDelete.length > 0) {
        const query = $.param( { files: imagesToDelete } );
        $.ajax({
            url : `/deleteFile?${query}`,
            type : 'DELETE',            
            processData: false,
            contentType: false,
            success : function(result, status, error) {
                next();
            },
            error : function(result, status, error) {
                console.error('Erreur dans la suppression : ' + error);
            },
        });
    } else {
        next();
    }

    function next() {
        let dataToSend = { 
            _id: _announce._id,
            name: $( '#name-announce' ).val(),
            type: $( '#type-announce' ).val(),
            published: $( '#publish-announce' ).is( ':checked' ),
            status: $( '#status-announce' ).val(),
            description: $( '#description-announce').val(),
            price: $( '#price-anounce' ).val(),
            date: $( '#date-announce' ).val(),
            photos: [ ..._announce.photos, ...fileNamesToSave ]
        }
    
        $.ajax({
            url : '/announces/modify',
            type : 'POST',
            contentType: 'application/json',
            data: JSON.stringify( dataToSend ),
            processData: false,
            success : function(result, status, error) {
                window.location='/';
                
            },
            error : function(result, status, error) {
                console.error('Erreur: ' + error);
            },
        });
    }
    
}

function fillAnnounceData( announce ) {console.log('check'); console.log(announce);
    $('#name-announce').val(announce.name);
    console.log($('#type-announce'));
    $('#type-announce').val(announce.type);
    if(announce.published) {
        $( '#publish-announce' ).attr('checked', true);
    }

    $('#status-announce').val(announce.status);
    $('#description-announce').val(announce.description);
    $('#price-anounce').val(announce.price);
    var announceDate = moment(announce.date);
    console.log(announceDate);
    console.log(announce.date);
    $('#date-announce').val(announceDate.format('YYYY-MM-DD')); // Utilisez le format correct ici

    // Charger les photos
    if( announce.photos.length > 0 ) {
        announce.photos.forEach( p => {
            createNewPhoto( p );
        } );
    }
};