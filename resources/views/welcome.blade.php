<!doctype html>
<html lang="{{ app()->getLocale() }}">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Laravel</title>

        <!-- Fonts -->
        <link href="https://fonts.googleapis.com/css?family=Raleway:100,600" rel="stylesheet" type="text/css">

        <!-- Styles -->
        <style>
            html, body {
                background-color: #fff;
                color: #636b6f;
                font-family: 'Raleway', sans-serif;
                font-weight: 100;
                height: 100vh;
                margin: 0;
            }

            .full-height {
                height: 100vh;
            }

            .flex-center {
                align-items: center;
                display: flex;
                justify-content: center;
            }

            .position-ref {
                position: relative;
            }

            .content {
                text-align: center;
            }

            .title {
                font-size: 64px;
            }

            .m-b-md {
                margin-bottom: 30px;
            }
        </style>
    </head>
    <body>
        <div class="flex-center position-ref full-height">
            <div class="content">
                <div class="title m-b-md">
                    Invisible reCAPTCHA - Ajax Example
                </div>

                g-recaptcha-response: 
                <div id="g-recaptcha-response">
                    not received yet
                </div>

				{!! Form::open(['name' => 'test-form', 'url' => url('api'), 'id' => 'test-form', 'data-ajax-form' => 'true']) !!}
                @captcha()
                {!! Form::submit('Sumbit') !!}
                {!! Form::close() !!}
            </div>
        </div>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
        <script src="{{ url('js/dcommon.js') }}"></script>
        <script type="text/javascript">
			dcommon.init();
            /*
			_submitEvent = function() {
                $.ajax({
                    type: "POST",
                    url: "{{ url('api') }}",
                    data: {
                        "_token": "{{ csrf_token() }}",
                        "g-recaptcha-response": $("#g-recaptcha-response").val()
                    },
                    dataType: "json",
                    success: function(data) {
                        console.log('submit successfully');
                        console.log(data);
                        $('#g-recaptcha-response').html(data.token)
                    },
                    error: function(data) {
                        console.log('error');
                    }
                });
            };
            */
        </script>
    </body>
</html>
