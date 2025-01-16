package edu.byu.cs.controller;

import edu.byu.cs.autograder.Grader;
import edu.byu.cs.dataAccess.DaoService;
import edu.byu.cs.dataAccess.DataAccessException;
import edu.byu.cs.model.QueueItem;
import org.eclipse.jetty.websocket.api.Session;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Controller for handling the queue of graders
 */
public class TrafficController {

    /**
     * A map of netIds to sessions that are subscribed to updates for that netId
     */
    private static final ConcurrentHashMap<String, List<Session>> sessions = new ConcurrentHashMap<>();

    public static ConcurrentHashMap<String, List<Session>> getSessions() {
        return sessions;
    }

    /**
     * The executor service that runs the graders
     */
    private final ExecutorService executorService = Executors.newFixedThreadPool(1);

    private static final TrafficController trafficController = new TrafficController();

    private TrafficController() {
    }

    public static TrafficController getInstance() {
        return trafficController;
    }

    /**
     * Broadcasts the current queue status to all connected clients.
     * Each client will be notified of their specific position in the queue.
     */
    public static void broadcastQueueStatus() throws DataAccessException {

        List<QueueItem> usersWaitingInQueue = new ArrayList<>();
        for (QueueItem item : DaoService.getQueueDao().getAll())
            if (!item.started())
                usersWaitingInQueue.add(item);

        usersWaitingInQueue.sort(Comparator.comparing(QueueItem::timeAdded));

        int i = 1;
        for (QueueItem item : usersWaitingInQueue) {
            getInstance().notifySubscribers(item.netId(), Map.of(
                    "type", "queueStatus",
                    "position", i,
                    "total", usersWaitingInQueue.size()
            ));
            i++;
        }
    }

    /**
     * Adds a grader to the queue. The grader will be run when there is an available thread
     *
     * @param grader the grader to add
     */
    public void addGrader(Grader grader) {
        executorService.submit(grader);
    }


    public void notifySubscribers(String netId, Map<String, Object> message) {
        List<Session> sessionList = sessions.get(netId);

        if (sessionList == null) return;
        for (Session session : sessionList) {
            if (session.isOpen()) {
                WebSocketController.send(session, message);
            }
        }
    }
}
