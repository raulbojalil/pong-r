using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;

namespace Pong3D
{
    public enum PlayerType
    {
        Host = 0,
        Guest = 1,
        Spectator = 2
    }

    public class PongServer : PersistentConnection
    {
        private static List<string[]> connections = new List<string[]>();

        private void SendPlayers(string lastConnected, string lastDisconnected)
        {
            for (var i = 0; i < connections.Count; i++)
            {
                Connection.Send(connections[i][0], string.Format("{{\"ptype\":{0}, \"host\":\"{1}\",\"guest\":\"{2}\", \"lastConnected\":\"{3}\", \"lastDisconnected\":\"{4}\", \"lastConnectedType\":{5}}}", 
                    i,
                    connections[0][1],
                    connections.Count > 1 ? connections[1][1] : string.Empty,
                    lastConnected, 
                    lastDisconnected,
                    !string.IsNullOrEmpty(lastConnected) ? (connections.Count - 1).ToString() : "-1")).Wait();
            }
        }

        protected override Task OnConnected(IRequest request, string connectionId)
        {
            return base.OnConnected(request, connectionId);
        }

        protected override Task OnDisconnected(IRequest request, string connectionId, bool stopCalled)
        {
            foreach (var conn in connections)
            {
                if (conn[0] == connectionId)
                {
                    connections.Remove(conn);
                    SendPlayers(string.Empty, conn[1]);
                    break;
                }
            }
            return base.OnDisconnected(request, connectionId, stopCalled);
        }
        protected override Task OnReceived(IRequest request, string connectionId, string data)
        {
            if (data.StartsWith("_"))
            {
                var playerName = data.Substring(1);
                connections.Add(new string[2] { connectionId, playerName });
                SendPlayers(playerName, string.Empty);
                return base.OnReceived(request, connectionId, data);   
            }
            else
                return Connection.Broadcast(data);
        }
    }
}