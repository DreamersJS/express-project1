
export const validateMessage = (message) => {
    return message && message.trim() !== '';
};

export const fetchMessages = async (roomName, page, order = 'asc', limit = 20, offset = 0) => {
    try {
        const response = await fetch(`/api/messages/rooms/${roomName}/messages?page=${page}&limit=${limit}&offset=${offset}&order=${order}`);

        if (!response.ok) {
            console.error(`Failed to fetch messages: ${response.status} ${response.statusText}`);
            return;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('Received non-JSON response');
            return;
        }

        const newMessages = await response.json();
        return newMessages;
    } catch (error) {
        console.error('Error fetching messages:', error);
        return;
    }
};

export const deleteMessageById = async (msgId) => {
    try {
        const response = await fetch(`/api/messages/messages/${msgId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

    } catch (error) {
        console.error('Error deleting message:', error);
    }
};

export const editMessageById = async (msgId, newMessage) => {
    try {
        if (newMessage.trim()) {
            const response = await fetch(`/api/messages/messages/${msgId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: newMessage }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
        }
    } catch (error) {
        console.error('Error editing message:', error);
    }
};
