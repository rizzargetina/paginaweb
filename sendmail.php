<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $to = "ptarifa@timolsrl.com";
    $subject = "Nuevo mensaje desde el formulario de contacto";
    $name = strip_tags($_POST["name"]);
    $email = filter_var($_POST["email"], FILTER_SANITIZE_EMAIL);
    $phone = strip_tags($_POST["phone"]);
    $asunto = strip_tags($_POST["subject"]);
    $message = strip_tags($_POST["message"]);

    $body = "Nombre: $name\n";
    $body .= "Correo: $email\n";
    $body .= "Teléfono: $phone\n";
    $body .= "Asunto: $asunto\n";
    $body .= "Mensaje:\n$message\n";

    $headers = "From: $email\r\nReply-To: $email\r\n";

    if (mail($to, $subject, $body, $headers)) {
        echo "Mensaje enviado correctamente.";
    } else {
        echo "Error al enviar el mensaje.";
    }
} else {
    echo "Método no permitido.";
}
?>
