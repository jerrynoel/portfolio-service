import sizeOf from 'image-size';
import axios from 'axios';

class ImageService {
    async getSize(imageUrl: string) {
        try {
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'utf-8');
            const dimension = sizeOf(buffer);
            return { height: dimension.height, width: dimension.width };
        } catch (e) {
            console.log('exception during imageService.getSize');
            console.log(e);
        }
        return { height: 0, width: 0 };
    }
}

const imageService = new ImageService();

export default imageService;
