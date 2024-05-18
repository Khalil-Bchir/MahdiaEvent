from flask import Flask, request, jsonify
import cv2
import numpy as np
from keras.models import load_model
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Set to '3' to suppress all warnings

app = Flask(__name__)

# Load the trained Keras model
model = load_model('my_keras_model.h5')

# Define your class names (adjust as needed)
class_names = [
    'battery', 'biological', 'brown-glass', 'cardboard', 'clothes',
    'green-glass', 'metal', 'paper', 'plastic', 'shoes', 'trash', 'white-glass'
]

@app.route('/predict', methods=['POST'])
def predict():
    try:
        image_file = request.files['image']
        img = cv2.imdecode(np.fromstring(image_file.read(), np.uint8), cv2.IMREAD_COLOR)
        img = cv2.resize(img, (224, 224))  # Resize to match model input shape
        img = np.expand_dims(img, axis=0)  # Add batch dimension
        predictions = model.predict(img)
        predicted_class_index = np.argmax(predictions[0])
        predicted_confidence = predictions[0][predicted_class_index]

        if predicted_confidence >= 0.96:
            predicted_class = class_names[predicted_class_index]
            return jsonify({'predicted_class': predicted_class})
        else:
            return jsonify({'message': 'Prediction is not clear.'})
    except Exception as e:
        return jsonify({'error': str(e)})


    
if __name__ == '__main__':
    app.run(debug=True)