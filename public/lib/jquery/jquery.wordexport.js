if (typeof jQuery !== "undefined" && typeof saveAs !== "undefined") {
    (function($) {
        $.fn.wordExport = function(options) {
            var settings = $.extend({
                filename: "jQuery-Word-Export",
                title: "jQuery Word Export File",
                stylesheet: null,
                header: null,
                styles: "",
                action: {"type": "download"},
                maxWidth: 624
            }, options);

            //fileName = typeof fileName !== 'undefined' ? fileName : "jQuery-Word-Export";
            var static = {
                mhtml: {
                    top: "Mime-Version: 1.0\nContent-Base: " + location.href + "\nContent-Type: Multipart/related; boundary=\"NEXT.ITEM-BOUNDARY\";type=\"text/html\"\n\n--NEXT.ITEM-BOUNDARY\nContent-Type: text/html; charset=\"utf-8\"\nContent-Location: " + location.href + "\n\n<!DOCTYPE html>\n<html xmlns:v=\"urn:schemas-microsoft-com:vml\" \n xmlns:o=\"urn:schemas-microsoft-com:office:office\" \n xmlns:w=\"urn:schemas-microsoft-com:office:word\" \n xmlns:m=\"http://schemas.microsoft.com/office/2004/12/omml\" \n xmlns=\"http://www.w3.org/TR/REC-html40\">\n_html_</html>",
                    head: "<head>\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\n<!--[if !mso]>\n<style>\n v\:* {behavior:url(#default#VML);}\n o\:* {behavior:url(#default#VML);}\n w\:* {behavior:url(#default#VML);}\n .shape {behavior:url(#default#VML);} \n</style>\n<![endif]-->\n<title>" + settings.title + "</title>\n<style>\n_styles_\n</style>\n<!--[if gte mso 9]><xml><o:DocumentProperties><o:Author>Hill PCI</o:Author><o:Company>Hill International Inc.</o:Company></o:DocumentProperties><o:OfficeDocumentSettings><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->\n</head>\n",
                    //head: "<head>\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\n<!--[if !mso]>\n<style>\n v\:* {behavior:url(#default#VML);}\n o\:* {behavior:url(#default#VML);}\n w\:* {behavior:url(#default#VML);}\n .shape {behavior:url(#default#VML);} \n</style>\n<![endif]-->\n<title>" + settings.title + "</title>\n<link rel=File-List href=\"" + settings.filename + "_files/filelist.xml\">\n<style>\n_styles_\n</style>\n<!--[if gte mso 9]><xml><o:DocumentProperties><o:Author>Hill PCI</o:Author><o:Company>Hill International Inc.</o:Company></o:DocumentProperties><o:OfficeDocumentSettings><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->\n</head>\n",
                    body: "<body lang=EN-US style='tab-interval:.5in'><div class=WordSection1>_body_</div></body>"
                }
            };
            var options = {
                maxWidth: 624
            };
            // Clone selected element before manipulating it
            var markup = $(this).clone();

            // Remove hidden elements from the output
            markup.each(function() {
                var self = $(this);
                if (self.is(':hidden'))
                    self.remove();
            });

            // Embed all images using Data URLs
            var images = Array();
            var img = markup.find('img');
            for (var i = 0; i < img.length; i++) {
                // Calculate dimensions of output image
                var w = Math.min(img[i].width, settings.maxWidth);
                var h = img[i].height * (w / img[i].width);
                // Create canvas for converting image to data URL
                var canvas = document.createElement("CANVAS");
                canvas.width = w;
                canvas.height = h;
                // Draw image to canvas
                var context = canvas.getContext('2d');
                context.drawImage(img[i], 0, 0, w, h);
                // Get data URL encoding of image
                var uri = canvas.toDataURL("image/png");
                $(img[i]).attr("src", img[i].src);
                img[i].width = w;
                img[i].height = h;
                // Save encoded image to array
                images[i] = {
                    type: uri.substring(uri.indexOf(":") + 1, uri.indexOf(";")),
                    encoding: uri.substring(uri.indexOf(";") + 1, uri.indexOf(",")),
                    location: $(img[i]).attr("src"),
                    data: uri.substring(uri.indexOf(",") + 1)
                };
            }

            // Prepare bottom of mhtml file with image data
            var mhtmlBottom = "\n";
            for (var i = 0; i < images.length; i++) {
                mhtmlBottom += "--NEXT.ITEM-BOUNDARY\n";
                mhtmlBottom += "Content-Location: " + images[i].location + "\n";
                mhtmlBottom += "Content-Type: " + images[i].type + "\n";
                mhtmlBottom += "Content-Transfer-Encoding: " + images[i].encoding + "\n\n";
                mhtmlBottom += images[i].data + "\n\n";
            }
            mhtmlBottom += "--NEXT.ITEM-BOUNDARY--";

            //TODO: load css from included stylesheet
            getStyles(settings.stylesheet, settings.styles, settings.filename)
                .then(function (styles) {
                    // Load header setup from included file
                    //getHeader(settings.header).then(function (header) {
                        // Aggregate parts of the file together
                        var fileContent = static.mhtml.top.replace("_html_", static.mhtml.head.replace("_styles_", styles) + static.mhtml.body.replace("_body_", markup.html())) + mhtmlBottom;
                        //var fileContent = static.mhtml.top.replace("_html_", static.mhtml.head.replace("_styles_", styles) + static.mhtml.body.replace("_body_", markup.html())) + mhtmlBottom + header;

                        // Create a Blob with the file contents
                        var blob = new Blob([fileContent], {
                            type: "application/msword;charset=utf-8"
                        });
                        console.log("Action Setting: " + settings.action);
                        if (settings.action.type == "upload") {
                            console.log("going to try uploading");
                            var fd = new FormData();
                            fd.append("token", localStorage.getItem('trello_token'));
                            fd.append("key", APP_KEY);
                            fd.append('name', settings.filename + ".doc");
                            fd.append('file', blob, settings.filename + ".doc");
                            var request = new XMLHttpRequest();
                            request.open("POST", "https://api.trello.com/1/cards/" + settings.action.cardid + "/attachments");
                            request.send(fd);
                        } else {
                            saveAs(blob, settings.filename + ".doc");
                        }
                        
                    //});
                });
        };

        function getStyles(stylesheet, styles, filename) {
            var deferred = jQuery.Deferred();
            if (stylesheet) {
                $.get(stylesheet, function (data) {
                    var styleContent = data.split("__headerpath__").join(filename + "_files/header.html");//.replace("__headerpath__", filename + "_files/header.html");
                    deferred.resolve(styleContent);
                    //deferred.resolve(data);
                });
            } else {
                deferred.resolve(styles);
            }
            return deferred.promise();
        }

        //function getHeader(settings) {
        //    var deferred = jQuery.Deferred();
        //    if (settings.headerFile) {
        //        $.get(settings.headerFile, function (data) {
        //            var mhtmlBottom = "\n";
        //            //mhtmlBottom += "--NEXT.ITEM-BOUNDARY\n";
        //            mhtmlBottom += "Content-Location: " + settings.filename + "_files/header.html\n";
        //            mhtmlBottom += "Content-Type: text/html; charset=\"unicode\"\n";
        //            mhtmlBottom += "Content-Transfer-Encoding: base64\n\n";
        //            mhtmlBottom += data + "\n\n";
        //            mhtmlBottom += "--NEXT.ITEM-BOUNDARY--";
        //            deferred.resolve(mhtmlBottom);
        //        });
        //    } else {
        //        deferred.resolve("");
        //    }
        //    return deferred.promise();
        //}
    })(jQuery);
} else {
    if (typeof jQuery === "undefined") {
        console.error("jQuery Word Export: missing dependency (jQuery)");
    }
    if (typeof saveAs === "undefined") {
        console.error("jQuery Word Export: missing dependency (FileSaver.js)");
    }
}
