import {
  Text,
  SafeAreaView,
  FlatList,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Button,
} from 'react-native';
import React, {FC, useEffect, useState} from 'react';

type Todo = {
  completed: boolean;
  id: number;
  todo: string;
  userId: number;
};

interface ItemProps extends Todo {
  index: number;
  handleOnPress: () => void;
  setText: React.Dispatch<React.SetStateAction<string>>;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  setEditingIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

const Item: FC<ItemProps> = ({
  index,
  todo,
  completed,
  handleOnPress,
  setText,
  setIsEdit,
  setEditingIndex,
}) => {
  return (
    <TouchableOpacity
      onPress={handleOnPress}
      onLongPress={() => {
        setText(todo);
        setIsEdit(true);
        setEditingIndex(index);
      }}>
      <View style={styles.item}>
        <Text>{index + 1}.</Text>
        <Text selectable={true} style={completed && styles.completed}>
          {todo}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const App = () => {
  const [todoData, setTodosData] = useState<Todo[]>([]);
  const [text, setText] = useState<string>('');
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [hasChanged, setHasChanged] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://dummyjson.com/todos');
        const data = await res.json();
        setTodosData(data.todos);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const handleOnPress = (index: number) => {
    setTodosData(prev => {
      const tempTodos = [...prev];
      const todo = tempTodos[index];
      todo.completed = !todo.completed;
      return tempTodos;
    });
  };

  const handleTextChange = (newText: string) => {
    if (isEdit && editingIndex !== null) {
      setHasChanged(newText.trim() !== todoData[editingIndex].todo);
    }
    setText(newText);
  };

  const handleAdd = () => {
    if (text.length === 0) {
      return;
    }

    const newItem = {
      // O(1)
      id: todoData.length + 1,
      todo: text.trim(),
      completed: false,
      userId: 1,
    };

    setTodosData(prev => [newItem, ...prev]);
    resetEditing();
  };

  const handleUpdate = () => {
    if (isEdit && editingIndex !== null) {
      setTodosData(prev => {
        const updatedTodos = [...prev];
        updatedTodos[editingIndex].todo = text;
        return updatedTodos;
      });
      resetEditing();
    }
  };

  const resetEditing = () => {
    setText('');
    setIsEdit(false);
    setHasChanged(false);
    setEditingIndex(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.addContainer}>
        <TextInput
          style={styles.input}
          onChangeText={handleTextChange}
          value={text}
          placeholder="Add text"
          multiline
        />
        <View style={styles.btnContainer}>
          {isEdit ? (
            <>
              {hasChanged && <Button title="Save" onPress={handleUpdate} />}
              <Button title="Cancel" onPress={resetEditing} />
            </>
          ) : (
            <Button title="Add" onPress={handleAdd} />
          )}
        </View>
      </View>

      <View style={styles.todoContainer}>
        <FlatList
          data={todoData}
          renderItem={({item, index}) => (
            <Item
              index={index}
              handleOnPress={() => handleOnPress(index)}
              setText={setText}
              setIsEdit={setIsEdit}
              setEditingIndex={setEditingIndex}
              {...item}
            />
          )}
          keyExtractor={item => item.id.toString()}
        />
      </View>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 5,
  },
  btnContainer: {
    flexDirection: 'row',
    gap: 5,
  },

  todoContainer: {
    alignItems: 'center',
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    gap: 3,
    paddingVertical: 8,
  },
  completed: {
    textDecorationLine: 'line-through',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    minWidth: 250,
    maxWidth: 350,
    height: 'auto',
  },
});
