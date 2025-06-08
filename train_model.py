import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.layers import Dense, Flatten
from tensorflow.keras.models import Sequential
from tensorflow.keras.optimizers import Adam

# Lokasi dataset
train_dir = "dataset/fresh"
val_dir = "dataset/non-fresh"

# Data augmentation dan preprocessing
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    horizontal_flip=True,
)

val_datagen = ImageDataGenerator(rescale=1./255)

train_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=(224, 224),
    batch_size=32,
    class_mode='binary'
)

val_generator = val_datagen.flow_from_directory(
    val_dir,
    target_size=(224, 224),
    batch_size=32,
    class_mode='binary'
)

# Model sederhana CNN
model = Sequential([
    tf.keras.applications.MobileNetV2(input_shape=(224,224,3), include_top=False, weights='imagenet', pooling='avg'),
    Dense(128, activation='relu'),
    Dense(1, activation='sigmoid')
])

# Hanya training dense layers saja
model.layers[0].trainable = False

model.compile(optimizer=Adam(learning_rate=0.0001),
              loss='binary_crossentropy',
              metrics=['accuracy'])

# Training model
model.fit(
    train_generator,
    epochs=10,
    validation_data=val_generator
)

# Simpan model
model.save('model/ikan_segarkan.h5')

print("Model berhasil disimpan di model/ikan_segarkan.h5")